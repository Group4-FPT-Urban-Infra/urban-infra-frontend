import { Component, inject, OnInit, OnDestroy, signal, PLATFORM_ID, effect } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { Router } from '@angular/router'
import { HomeStore } from './home.store'
import { NearbyIssueResponse } from '../../core/services/dashboard.service'

@Component({
  selector: 'app-home-page',
  imports: [],
  styles: [
    `
      .feed-scroll::-webkit-scrollbar { width: 4px; }
      .feed-scroll::-webkit-scrollbar-track { background: transparent; }
      .feed-scroll::-webkit-scrollbar-thumb {
        background-color: var(--color-outline-variant);
        border-radius: 4px;
      }
      .icon-filled { font-variation-settings: 'FILL' 1; }

      #home-map {
        width: 100%;
        height: 100%;
        background-color: var(--color-surface-dim);
        z-index: 1;
      }
      /* Ensure Leaflet popups appear below the modal (modal is z-50) */
      .leaflet-popup {
        z-index: 40 !important;
      }
      .leaflet-popup-content-wrapper {
        z-index: 40 !important;
      }
      .leaflet-container {
        z-index: 1 !important;
      }
    `,
  ],
  template: `
    <main class="flex flex-grow flex-col">

      <!-- ── Hero Section ───────────────────────────────────────────────── -->
      <section
        class="relative flex flex-col items-center justify-center overflow-hidden px-4 py-16 text-center md:py-20"
      >
        <div
          class="pointer-events-none absolute inset-0 z-0 opacity-20"
          style="
            background-image: url('/civic_hero_city.jpg');
            background-size: cover;
            background-position: center;
          "
          aria-hidden="true"
        ></div>

        <div class="relative z-10 flex max-w-3xl flex-col items-center gap-6">
          <h1
            class="text-[36px] font-bold leading-tight tracking-tight text-[var(--color-on-surface)]"
            style="letter-spacing: -0.02em"
          >
            Build a Better City Together
          </h1>
          <p class="max-w-xl text-base leading-6 text-[var(--color-on-surface-variant)]">
            Report issues, track progress, and collaborate with your local government to maintain a
            safe and beautiful urban environment.
          </p>
          <div class="mt-2 flex flex-col gap-4 sm:flex-row">
            <button
              id="reportIncidentBtn"
              (click)="navigateToCreateIncident()"
              class="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-4 text-sm font-semibold text-[var(--color-on-primary)] shadow-sm transition-shadow hover:shadow-md"
            >
              <span class="material-symbols-outlined icon-filled text-[20px]" aria-hidden="true"
                >add_circle</span
              >
              Report Incident
            </button>
            <button
              id="viewMapBtn"
              (click)="scrollToMap()"
              class="flex items-center justify-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-6 py-4 text-sm font-semibold text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]"
            >
              <span class="material-symbols-outlined text-[20px]" aria-hidden="true">map</span>
              View Incident Map
            </button>
          </div>
        </div>
      </section>

      <!-- ── Stats Section ──────────────────────────────────────────────── -->
      <section class="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">

          <!-- Stat: Active Incidents -->
          <div
            class="flex items-start gap-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-error-container)] text-[var(--color-on-error-container)]"
            >
              <span class="material-symbols-outlined" aria-hidden="true">report_problem</span>
            </div>
            <div>
              @if (store.isLoadingStats()) {
                <div class="h-8 w-20 animate-pulse rounded bg-[var(--color-surface-dim)]"></div>
              } @else {
                <h3 class="text-2xl font-semibold leading-8 text-[var(--color-on-surface)]">
                  {{ store.formattedActiveIssues() }}
                </h3>
              }
              <p class="text-sm text-[var(--color-on-surface-variant)]">Active Incidents</p>
            </div>
          </div>

          <!-- Stat: Resolved This Week -->
          <div
            class="flex items-start gap-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            >
              <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
            </div>
            <div>
              @if (store.isLoadingStats()) {
                <div class="h-8 w-20 animate-pulse rounded bg-[var(--color-surface-dim)]"></div>
              } @else {
                <h3 class="text-2xl font-semibold leading-8 text-[var(--color-on-surface)]">
                  {{ store.formattedResolved() }}
                </h3>
              }
              <p class="text-sm text-[var(--color-on-surface-variant)]">Resolved This Week</p>
            </div>
          </div>

          <!-- Stat: Citizen Participants -->
          <div
            class="flex items-start gap-4 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-fixed)] text-[var(--color-on-primary-fixed)]"
            >
              <span class="material-symbols-outlined" aria-hidden="true">group</span>
            </div>
            <div>
              @if (store.isLoadingStats()) {
                <div class="h-8 w-20 animate-pulse rounded bg-[var(--color-surface-dim)]"></div>
              } @else {
                <h3 class="text-2xl font-semibold leading-8 text-[var(--color-on-surface)]">
                  {{ store.formattedCitizens() }}
                </h3>
              }
              <p class="text-sm text-[var(--color-on-surface-variant)]">Citizen Participants</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Overview Bento Grid ────────────────────────────────────────── -->
      <section class="mx-auto w-full max-w-7xl px-4 pb-10 pt-2 md:px-8">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-[28px] font-semibold leading-9 text-[var(--color-on-surface)]"
            style="letter-spacing: -0.01em"
          >
            Overview
          </h2>
          <button
            (click)="requestLocationAndReload()"
            class="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            <span class="material-symbols-outlined text-[18px]">my_location</span>
            Use My Location
          </button>
        </div>

        <div class="grid h-auto grid-cols-1 gap-6 lg:h-[600px] lg:grid-cols-12">

          <!-- Map Preview (8 cols) -->
          <div
            id="map-section"
            class="flex flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] lg:col-span-8"
          >
            <!-- Card header -->
            <div
              class="flex items-center justify-between border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3"
            >
              <h3 class="flex items-center gap-2 text-[18px] font-semibold text-[var(--color-on-surface)]">
                <span
                  class="material-symbols-outlined text-[var(--color-primary)]"
                  aria-hidden="true"
                  >public</span
                >
                Nearby Incidents
              </h3>
              <span class="text-sm text-[var(--color-on-surface-variant)]">
                {{ store.nearbyIssues().length }} found
              </span>
            </div>

            <!-- Map container -->
            <div class="relative flex-grow">
              <div id="home-map"></div>

              <!-- Loading overlay -->
              @if (store.isLoadingNearby()) {
                <div class="absolute inset-0 flex items-center justify-center bg-[var(--color-surface)]/80 backdrop-blur-sm">
                  <div class="flex flex-col items-center gap-2">
                    <span class="material-symbols-outlined animate-spin text-3xl text-[var(--color-primary)]">progress_activity</span>
                    <span class="text-sm text-[var(--color-on-surface-variant)]">Loading nearby incidents...</span>
                  </div>
                </div>
              }

              <!-- Legend overlay -->
              @if (!store.isLoadingNearby() && store.nearbyIssues().length > 0) {
                <div
                  class="absolute left-4 top-4 flex flex-col gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 p-3 shadow-sm backdrop-blur-md"
                >
                  <div class="flex items-center gap-2">
                    <div class="h-3 w-3 rounded-full bg-[var(--color-error)]"></div>
                    <span class="text-[11px] font-medium">Vị trí của bạn</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="h-3 w-3 rounded-full bg-green-500"></div>
                    <span class="text-[11px] font-medium">Sự cố gần đây</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Latest Incidents Feed (4 cols) -->
          <div
            class="flex flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-[0px_4px_20px_rgba(0,0,0,0.05)] lg:col-span-4"
          >
            <!-- Panel header -->
            <div
              class="border-b border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] px-4 py-3"
            >
              <h3 class="text-[18px] font-semibold text-[var(--color-on-surface)]">
                Latest Incidents
              </h3>
            </div>

            <!-- Scrollable feed -->
            <div class="feed-scroll flex flex-grow flex-col gap-2 overflow-y-auto p-2">
              @if (store.isLoadingLatest()) {
                @for (i of [1, 2, 3]; track i) {
                  <div class="flex gap-4 rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface)] p-4">
                    <div class="h-16 w-16 shrink-0 animate-pulse rounded bg-[var(--color-surface-dim)]"></div>
                    <div class="flex w-full flex-col justify-between gap-2">
                      <div class="h-4 w-3/4 animate-pulse rounded bg-[var(--color-surface-dim)]"></div>
                      <div class="h-3 w-1/2 animate-pulse rounded bg-[var(--color-surface-dim)]"></div>
                    </div>
                  </div>
                }
              } @else if (store.latestIssues().length === 0) {
                <div class="flex flex-col items-center justify-center py-8 text-[var(--color-on-surface-variant)]">
                  <span class="material-symbols-outlined text-3xl">inbox</span>
                  <p class="mt-2 text-sm">No incidents yet</p>
                </div>
              } @else {
                @for (issue of store.latestIssues(); track issue.id) {
                  <div
                    class="flex cursor-pointer gap-4 rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface)] p-4 transition-colors hover:bg-[var(--color-surface-container)]"
                    (click)="openIssueOnMap(issue)"
                  >
                    <!-- Thumbnail -->
                    <div
                      class="h-16 w-16 shrink-0 overflow-hidden rounded bg-[var(--color-surface-dim)]"
                    >
                      @if (store.getImageUrl(issue.thumbnailUrl)) {
                        <img
                          [src]="store.getImageUrl(issue.thumbnailUrl)!"
                          [alt]="issue.title"
                          class="h-full w-full object-cover"
                        />
                      } @else {
                        <div
                          class="flex h-full w-full items-center justify-center text-[var(--color-outline)]"
                        >
                          <span class="material-symbols-outlined" aria-hidden="true">report</span>
                        </div>
                      }
                    </div>

                    <!-- Info -->
                    <div class="flex w-full flex-col justify-between">
                      <div class="flex items-start justify-between gap-1">
                        <h4
                          class="line-clamp-1 text-sm font-semibold text-[var(--color-on-surface)]"
                        >
                          {{ issue.title }}
                        </h4>
                        <!-- Status badge -->
                        <span
                          class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          [class]="getStatusClass(issue.status.code)"
                        >
                          {{ issue.status.name }}
                        </span>
                      </div>
                      <p class="line-clamp-1 text-xs text-[var(--color-on-surface-variant)]">
                        {{ issue.issueType.name }}
                      </p>
                      <div
                        class="mt-1 flex items-center gap-3 text-[var(--color-outline)]"
                      >
                        <span class="material-symbols-outlined text-[16px]" aria-hidden="true"
                          >thumb_up</span
                        >
                        <span class="text-[11px]">{{ issue.upvoteCount }}</span>
                        <span
                          class="material-symbols-outlined ml-2 text-[16px]"
                          aria-hidden="true"
                          >schedule</span
                        >
                        <span class="text-[11px]">{{ store.formatTimeAgo(issue.reportedAt) }}</span>
                      </div>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- View all footer -->
            <div
              class="border-t border-[var(--color-outline-variant)] bg-[var(--color-surface)] p-2"
            >
              <button
                id="viewAllIncidentsBtn"
                class="w-full rounded py-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-container)]/10"
                type="button"
              >
                View All Incidents
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Issue Detail Modal -->
    @if (store.selectedIssue()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        (click)="closeModal($event)"
      >
        <div
          class="max-w-lg w-full rounded-2xl bg-[var(--color-surface)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          (click)="$event.stopPropagation()"
        >
          <!-- Image header -->
          <div class="relative h-48 bg-[var(--color-surface-dim)] shrink-0">
            @if (store.getImageUrl(store.selectedIssue()!.thumbnailUrl)) {
              <img
                [src]="store.getImageUrl(store.selectedIssue()!.thumbnailUrl)!"
                [alt]="store.selectedIssue()!.title"
                class="h-full w-full object-cover"
              />
            } @else {
              <div class="flex h-full items-center justify-center text-[var(--color-outline)]">
                <span class="material-symbols-outlined text-6xl">report</span>
              </div>
            }
            <button
              (click)="store.closeModal()"
              class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
            <span
              class="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold"
              [class]="getStatusClass(store.selectedIssue()!.status.code)"
            >
              {{ store.selectedIssue()!.status.name }}
            </span>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto">
            <div class="mb-4">
              <p class="mb-1 text-xs text-[var(--color-primary)]">
                {{ store.selectedIssue()!.publicCode }}
              </p>
              <h2 class="text-xl font-semibold text-[var(--color-on-surface)]">
                {{ store.selectedIssue()!.title }}
              </h2>
            </div>

            <div class="mb-4 flex flex-wrap gap-2">
              <span class="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-container)] px-3 py-1 text-xs text-[var(--color-on-surface-variant)]">
                <span class="material-symbols-outlined text-[14px]">category</span>
                {{ store.selectedIssue()!.issueType.name }}
              </span>
              <span class="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-container)] px-3 py-1 text-xs text-[var(--color-on-surface-variant)]">
                <span class="material-symbols-outlined text-[14px]">location_on</span>
                {{ store.selectedIssue()!.area.name }}
              </span>
            </div>

            <div class="flex items-center gap-4 text-sm text-[var(--color-on-surface-variant)]">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px]">thumb_up</span>
                {{ store.selectedIssue()!.upvoteCount }} upvotes
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px]">schedule</span>
                {{ formatTimeAgo(store.selectedIssue()!.reportedAt) }}
              </span>
              @if (store.selectedIssue()!.distanceMeters) {
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">near_me</span>
                  {{ formatDistance(store.selectedIssue()!.distanceMeters) }}
                </span>
              }
            </div>

            <!-- Multiple issues at location navigation -->
            @if (store.issuesAtSelectedLocation().length > 1) {
              <div class="mt-6 border-t border-[var(--color-outline-variant)] pt-4">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[var(--color-primary)]">location_on</span>
                    <span class="text-sm font-medium text-[var(--color-on-surface)]">
                      {{ store.issuesAtSelectedLocation().length }} incidents at this location
                    </span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-xs text-[var(--color-on-surface-variant)]">
                      {{ store.issuesAtSelectedLocation().indexOf(store.selectedIssue()!) + 1 }} / {{ store.issuesAtSelectedLocation().length }}
                    </span>
                  </div>
                </div>

                <!-- Navigation buttons -->
                <div class="flex gap-2 mb-3">
                  <button
                    (click)="navigateIssue(-1)"
                    [disabled]="store.issuesAtSelectedLocation().indexOf(store.selectedIssue()!) === 0"
                    class="flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-40"
                    [class]="store.issuesAtSelectedLocation().indexOf(store.selectedIssue()!) === 0
                      ? 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] cursor-not-allowed'
                      : 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] hover:bg-[var(--color-primary)]/20'"
                  >
                    <span class="material-symbols-outlined text-[18px]">chevron_left</span>
                    Previous
                  </button>
                  <button
                    (click)="navigateIssue(1)"
                    [disabled]="store.issuesAtSelectedLocation().indexOf(store.selectedIssue()!) === store.issuesAtSelectedLocation().length - 1"
                    class="flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors disabled:opacity-40"
                    [class]="store.issuesAtSelectedLocation().indexOf(store.selectedIssue()!) === store.issuesAtSelectedLocation().length - 1
                      ? 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] cursor-not-allowed'
                      : 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] hover:bg-[var(--color-primary)]/20'"
                  >
                    Next
                    <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>

                <!-- Issue list -->
                <div class="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  @for (issue of store.issuesAtSelectedLocation(); track issue.id) {
                    <div
                      (click)="store.selectIssue(issue)"
                      class="flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors"
                      [class]="issue.id === store.selectedIssue()!.id
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-container)]/30'
                        : 'border-[var(--color-outline-variant)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-container)]'"
                    >
                      <div class="shrink-0">
                        @if (store.getImageUrl(issue.thumbnailUrl)) {
                          <img
                            [src]="store.getImageUrl(issue.thumbnailUrl)!"
                            [alt]="issue.title"
                            class="h-10 w-10 rounded object-cover"
                          />
                        } @else {
                          <div class="h-10 w-10 rounded bg-[var(--color-surface-dim)] flex items-center justify-center">
                            <span class="material-symbols-outlined text-[18px] text-[var(--color-outline)]">report</span>
                          </div>
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-[var(--color-on-surface)] truncate">
                          {{ issue.title }}
                        </p>
                        <p class="text-xs text-[var(--color-on-surface-variant)]">
                          {{ issue.issueType.name }} • {{ formatTimeAgo(issue.reportedAt) }}
                        </p>
                      </div>
                      <span
                        class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        [class]="getStatusClass(issue.status.code)"
                      >
                        {{ issue.status.name }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class HomePage implements OnInit, OnDestroy {
  protected readonly store = inject(HomeStore)
  private readonly router = inject(Router)
  private readonly platformId = inject(PLATFORM_ID)

  private map: any = null
  private markers: any[] = []
  private currentLocationMarker: any = null
  private defaultLocation = { lat: 20.46, lng: 106.138 } // Ha Long, Vietnam

  private mapReady = false

  constructor() {
    // Re-render markers whenever nearby issues change
    effect(() => {
      const issues = this.store.nearbyIssues()
      if (this.mapReady && this.map && typeof window !== 'undefined') {
        this.updateMapMarkers()
      }
    })
  }

  ngOnInit(): void {
    this.store.loadAll()
    if (isPlatformBrowser(this.platformId)) {
      this.initMap()
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove()
    }
  }

  private initMap(): void {
    if (typeof window === 'undefined') return

    const mapContainer = document.getElementById('home-map')
    if (!mapContainer) return

    // Dynamically load Leaflet
    if (!(window as any).L) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => this.createMap()
      document.head.appendChild(script)
    } else {
      this.createMap()
    }
  }

  private createMap(): void {
    const L = (window as any).L
    const mapContainer = document.getElementById('home-map')
    if (!mapContainer || !L) return

    this.map = L.map('home-map', { closePopupOnClick: false }).setView([this.defaultLocation.lat, this.defaultLocation.lng], 14)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      language: 'en',
    }).addTo(this.map)

    this.mapReady = true

    // Listen for custom events from popup clicks
    window.addEventListener('selectIssue', ((event: CustomEvent) => {
      const issueId = event.detail as number
      const issues = this.store.nearbyIssues()
      const issue = issues.find((i) => i.id === issueId)
      if (issue) {
        this.store.selectIssue(issue)
      }
    }) as EventListener)

    // Auto-detect user location
    this.requestLocationAndReload()

    this.updateMapMarkers()
  }

  private updateMapMarkers(): void {
    if (!this.map || typeof window === 'undefined') return

    const L = (window as any).L
    if (!L) return

    // Clear existing issue markers
    this.markers.forEach((m) => m.remove())
    this.markers = []

    const issues = this.store.nearbyIssues()
    // Group issues by coordinate (rounded to 5 decimal places for grouping)
    const issueGroups = new Map<string, NearbyIssueResponse[]>()
    issues.forEach((issue) => {
      const key = `${issue.latitude.toFixed(5)},${issue.longitude.toFixed(5)}`
      if (!issueGroups.has(key)) {
        issueGroups.set(key, [])
      }
      issueGroups.get(key)!.push(issue)
    })

    issueGroups.forEach((groupIssues) => {
      const firstIssue = groupIssues[0]
      const markerColor = this.getMarkerColor(firstIssue.status.code)
      const hasMultiple = groupIssues.length > 1

      // Marker icon with count badge if multiple
      const badgeHtml = hasMultiple
        ? `<div style="position: absolute; top: -8px; right: -8px; background: #6750A4; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">${groupIssues.length}</div>`
        : ''

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="position: relative;">${badgeHtml}<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
      })

      const marker = L.marker([firstIssue.latitude, firstIssue.longitude], { icon })

      // Build popup content with list if multiple
      // Popup only opens on long press, not regular click - modal handles clicks
      if (hasMultiple) {
        const listItems = groupIssues
          .map(
            (issue) =>
              `<div class="issue-list-item" data-id="${issue.id}" style="cursor: pointer; padding: 6px 4px; border-bottom: 1px solid #eee; font-size: 12px;" ontouchstart="window.dispatchEvent(new CustomEvent('selectIssue', {detail: ${issue.id}}))" onclick="window.dispatchEvent(new CustomEvent('selectIssue', {detail: ${issue.id}}))">
                <strong>${issue.title.substring(0, 30)}${issue.title.length > 30 ? '...' : ''}</strong><br/>
                <span style="color: #666;">${issue.issueType.name} • ${issue.status.name}</span>
              </div>`
          )
          .join('')
        marker.bindPopup(
          `<div style="min-width: 180px; max-height: 300px; overflow-y: auto;">
            <div style="font-weight: bold; padding: 8px 4px; background: #f5f5f5; margin: -8px -8px 8px -8px;">${groupIssues.length} incidents here</div>
            ${listItems}
          </div>`,
          { closeButton: true, autoPan: false }
        )
      }

      // Click handler - show modal, not popup
      marker.on('click', (e: any) => {
        this.store.selectIssue(firstIssue)
        // Close any open popup after a short delay
        setTimeout(() => {
          this.map.closePopup()
        }, 100)
      })

      // Long press to open popup with list
      let longPressTimer: any
      marker.on('mousedown', () => {
        longPressTimer = setTimeout(() => {
          if (hasMultiple) {
            marker.openPopup()
          }
        }, 500)
      })
      marker.on('mouseup', () => clearTimeout(longPressTimer))
      marker.on('touchstart', () => {
        longPressTimer = setTimeout(() => {
          if (hasMultiple) {
            marker.openPopup()
          }
        }, 500)
      })
      marker.on('touchend', () => clearTimeout(longPressTimer))

      // Double click to zoom in
      marker.on('dblclick', () => {
        this.map.setView([firstIssue.latitude, firstIssue.longitude], 16)
      })

      marker.addTo(this.map)
      this.markers.push(marker)
    })

    // Update user location marker
    this.updateUserLocationMarker(L)
  }

  private updateUserLocationMarker(L: any): void {
    const currentLocation = this.store.currentLocation()
    if (!currentLocation || !this.map) return

    // Remove existing user marker
    if (this.currentLocationMarker) {
      this.currentLocationMarker.remove()
      this.currentLocationMarker = null
    }

    // Red marker for current user location
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background-color: #ef4444;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        "></div>
        <div style="
          width: 40px;
          height: 40px;
          background-color: rgba(239,68,68,0.2);
          border-radius: 50%;
          position: absolute;
          top: -10px;
          left: -10px;
          animation: pulse 2s infinite;
        "></div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    })

    this.currentLocationMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup('<strong>Vị trí của bạn</strong>')

    // Ensure user location marker stays below issue markers (z-index offset)
    if (this.currentLocationMarker.setZIndexOffset) {
      this.currentLocationMarker.setZIndexOffset(-1000)
    }
  }

  private getMarkerColor(statusCode: string): string {
    switch (statusCode?.toUpperCase()) {
      case 'NEW':
        return '#6750A4' // primary
      case 'IN_PROGRESS':
        return '#625B71' // tertiary
      case 'RESOLVED':
      case 'CLOSED':
        return '#386A20' // success green
      case 'REJECTED':
        return '#BA1A1A' // error red
      default:
        return '#79747E' // outline
    }
  }

  requestLocationAndReload(): void {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        this.store.loadNearbyIssues(latitude, longitude, 20000) // 20km radius
        if (this.map) {
          this.map.setView([latitude, longitude], 14)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        // Fallback: load with default location
        this.store.loadNearbyIssues(this.defaultLocation.lat, this.defaultLocation.lng, 20000)
      }
    )
  }

  openIssueOnMap(issue: any): void {
    this.store.selectIssue(issue)
    if (this.map) {
      this.map.setView([issue.latitude, issue.longitude], 16)
      this.map.closePopup()
    }
  }

  navigateIssue(direction: number): void {
    const issues = this.store.issuesAtSelectedLocation()
    const current = this.store.selectedIssue()
    if (!current || issues.length <= 1) return

    const currentIndex = issues.findIndex((i) => i.id === current.id)
    const newIndex = currentIndex + direction

    if (newIndex >= 0 && newIndex < issues.length) {
      this.store.selectIssue(issues[newIndex])
      if (this.map) {
        this.map.closePopup()
      }
    }
  }

  formatTimeAgo(date: string): string {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hr ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return d.toLocaleDateString()
  }

  closeModal(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.store.closeModal()
    }
  }

  scrollToMap(): void {
    const mapSection = document.getElementById('map-section')
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  navigateToCreateIncident(): void {
    void this.router.navigate(['/incident-reporting'])
  }

  protected getStatusClass(statusCode: string): string {
    const code = statusCode?.toUpperCase() || ''

    if (code === 'NEW' || code === 'ASSIGNED' || code === 'IN_PROGRESS' || code === 'PENDING_INFO') {
      return 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
    }
    if (code === 'RESOLVED' || code === 'CLOSED') {
      return 'bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]'
    }
    if (code === 'REJECTED') {
      return 'bg-[var(--color-error)] text-white'
    }
    return 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]'
  }

  protected formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    }
    return `${(meters / 1000).toFixed(1)}km`
  }
}
