import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { AuthStore } from '../../core/auth/auth.store'
import {
  StaffService,
  StaffDashboardSummaryResponse,
  StaffTaskResponse,
  StaffActivityResponse,
  StaffMapIssueResponse,
} from './staff.service'
import * as L from 'leaflet'

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DEFAULT_ISSUE_TYPE_COLORS: Record<string, string> = {
  LIGHT: '#fbbf24',
  POTHOLE: '#ef4444',
  FLOOD: '#3b82f6',
  TRASH: '#22c55e',
  SIGN: '#a855f7',
  DEFAULT: '#6b7280',
}

@Component({
  selector: 'app-staff-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[var(--color-surface)] p-4 md:p-8">
      <!-- Page Header -->
      <header class="mb-6 flex items-end justify-between">
        <div>
          <h2
            class="text-[36px] font-bold text-[var(--color-on-surface)]"
            style="letter-spacing: -0.02em; line-height: 44px;"
          >
            Good Morning, {{ userName() }}
          </h2>
          <p class="mt-1 text-[14px] text-[var(--color-on-surface-variant)]">
            Here is your daily incident overview for
            {{ dashboardSummary()?.departmentName || 'your district' }}.
          </p>
        </div>
        <div class="hidden items-center gap-4 md:flex">
          <a
            href="/staff/incidents"
            class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-low)]"
          >
            <span class="material-symbols-outlined text-[16px]">filter_list</span>
            Filter
          </a>
          <button
            class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-low)]"
          >
            <span class="material-symbols-outlined text-[16px]">download</span>
            Export
          </button>
        </div>
      </header>

      <!-- Metrics Bento Grid -->
      <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <!-- Assigned Incidents -->
        <div
          class="flex flex-col justify-between rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="mb-4 flex items-start justify-between">
            <span
              class="text-[12px] font-medium tracking-wider text-[var(--color-on-surface-variant)] uppercase"
            >
              Assigned Incidents
            </span>
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-fixed)]/20 text-[var(--color-primary)]"
            >
              <span class="material-symbols-outlined text-[20px]">assignment_ind</span>
            </div>
          </div>
          <div>
            @if (isLoadingSummary()) {
              <div class="h-8 w-20 animate-pulse rounded bg-[var(--color-surface-dim)]"></div>
            } @else {
              <h3 class="text-[28px] font-bold text-[var(--color-on-surface)]">
                {{ dashboardSummary()?.totalOpenIssues || 0 }}
              </h3>
            }
            <p
              class="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--color-secondary)]"
            >
              <span class="material-symbols-outlined text-[14px]">trending_flat</span>
              {{ dashboardSummary()?.inProgressIssues || 0 }} in progress
            </p>
          </div>
        </div>

        <!-- High Priority Tasks (New Issues) -->
        <div
          class="flex flex-col justify-between rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="mb-4 flex items-start justify-between">
            <span
              class="text-[12px] font-medium tracking-wider text-[var(--color-on-surface-variant)] uppercase"
            >
              New Issues
            </span>
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-error-container)] text-[var(--color-on-error-container)]"
            >
              <span class="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div>
            @if (isLoadingSummary()) {
              <div class="h-8 w-12 animate-pulse rounded bg-[var(--color-surface-dim)]"></div>
            } @else {
              <h3 class="text-[28px] font-bold text-[var(--color-on-surface)]">
                {{ dashboardSummary()?.newIssues || 0 }}
              </h3>
            }
            <p
              class="mt-1 flex items-center gap-1 text-[11px] font-medium"
              [ngClass]="(dashboardSummary()?.slaBreachedOpenIssues || 0) > 0 ? 'text-[var(--color-error)]' : 'text-[var(--color-secondary)]'"
            >
              @if ((dashboardSummary()?.slaBreachedOpenIssues || 0) > 0) {
                <span class="material-symbols-outlined text-[14px]">error</span>
                {{ dashboardSummary()?.slaBreachedOpenIssues }} SLA breached
              } @else {
                <span class="material-symbols-outlined text-[14px]">check_circle</span>
                All on track
              }
            </p>
          </div>
        </div>

        <!-- Resolved This Week -->
        <div
          class="flex flex-col justify-between rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="mb-4 flex items-start justify-between">
            <span
              class="text-[12px] font-medium tracking-wider text-[var(--color-on-surface-variant)] uppercase"
            >
              Resolved This Week
            </span>
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-tertiary-fixed)]/20 text-[var(--color-tertiary-container)]"
            >
              <span class="material-symbols-outlined text-[20px]">task_alt</span>
            </div>
          </div>
          <div>
            @if (isLoadingSummary()) {
              <div class="h-8 w-16 animate-pulse rounded bg-[var(--color-surface-dim)]"></div>
            } @else {
              <h3 class="text-[28px] font-bold text-[var(--color-on-surface)]">
                {{ dashboardSummary()?.recentlyResolvedIssues || 0 }}
              </h3>
            }
            <p
              class="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--color-secondary)]"
            >
              <span class="material-symbols-outlined text-[14px]">schedule</span>
              Last 7 days
            </p>
          </div>
        </div>

        <!-- My Tasks Count -->
        <div
          class="flex flex-col justify-between rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="mb-4 flex items-start justify-between">
            <span
              class="text-[12px] font-medium tracking-wider text-[var(--color-on-surface-variant)] uppercase"
            >
              My Tasks
            </span>
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]"
            >
              <span class="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
          </div>
          <div>
            @if (isLoadingTasks()) {
              <div class="h-8 w-12 animate-pulse rounded bg-[var(--color-surface-dim)]"></div>
            } @else {
              <h3 class="text-[28px] font-bold text-[var(--color-on-surface)]">
                {{ myTasks().length }}
              </h3>
            }
            <p class="mt-1 text-[11px] font-medium text-[var(--color-on-surface-variant)]">
              Pending tasks assigned
            </p>
          </div>
        </div>
      </div>

      <!-- Main Grid Layout -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Left Column: Priority Tasks & Activity -->
        <div class="flex flex-col gap-6 lg:col-span-2">
          <!-- Priority Inbox -->
          <section
            class="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] shadow-sm"
          >
            <div
              class="flex items-center justify-between border-b border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-bright)] px-6 py-4"
            >
              <h3 class="text-[18px] font-semibold text-[var(--color-on-surface)]">
                Priority Tasks
              </h3>
              <a
                href="/staff/incidents"
                class="text-[12px] font-medium text-[var(--color-primary)] hover:underline"
              >
                View All
              </a>
            </div>
            <div class="flex-1 overflow-y-auto">
              @if (isLoadingTasks()) {
                @for (i of [1, 2, 3]; track i) {
                  <div class="border-b border-[var(--color-outline-variant)]/50 p-4">
                    <div class="mb-2 flex items-center gap-2">
                      <div
                        class="h-5 w-16 animate-pulse rounded-full bg-[var(--color-surface-dim)]"
                      ></div>
                      <div
                        class="h-4 w-20 animate-pulse rounded bg-[var(--color-surface-dim)]"
                      ></div>
                    </div>
                    <div
                      class="mb-2 h-5 w-3/4 animate-pulse rounded bg-[var(--color-surface-dim)]"
                    ></div>
                    <div
                      class="h-4 w-full animate-pulse rounded bg-[var(--color-surface-dim)]"
                    ></div>
                  </div>
                }
              } @else if (myTasks().length === 0) {
                <div class="flex flex-col items-center justify-center p-8 text-center">
                  <span class="material-symbols-outlined text-4xl text-[var(--color-outline)]"
                    >check_circle</span
                  >
                  <p class="mt-2 text-[14px] text-[var(--color-on-surface-variant)]">
                    No pending tasks. Great job!
                  </p>
                </div>
              } @else {
                @for (task of myTasks().slice(0, 10); track task.issueId) {
                  <a
                    [routerLink]="['/staff/incidents', task.issueId]"
                    class="flex items-start gap-4 border-b border-[var(--color-outline-variant)]/30 p-4 transition-colors hover:bg-[var(--color-surface-container-low)] last:border-b-0"
                  >
                    <!-- Priority Indicator -->
                    <div class="flex shrink-0 flex-col items-center">
                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-lg"
                        [ngClass]="getPriorityBgClass(task.priority.code)"
                      >
                        <span class="material-symbols-outlined text-[20px]" [ngClass]="getPriorityIconColorClass(task.priority.code)">
                          {{ getPriorityIcon(task.priority.code) }}
                        </span>
                      </div>
                      @if (task.isSlaBreached) {
                        <span class="mt-1 animate-pulse text-[10px] font-bold text-[var(--color-error)]">!</span>
                      }
                    </div>

                    <!-- Content -->
                    <div class="min-w-0 flex-1">
                      <div class="mb-1 flex items-center gap-2">
                        <span
                          class="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          [ngClass]="getPriorityBadgeClass(task.priority.code)"
                        >
                          {{ task.priority.name }}
                        </span>
                        <span class="text-[11px] font-medium text-[var(--color-primary)]">
                          {{ task.publicCode }}
                        </span>
                        @if (task.isSlaBreached) {
                          <span class="rounded bg-[var(--color-error)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                            SLA
                          </span>
                        }
                      </div>
                      <h4 class="mb-1.5 text-[15px] font-semibold text-[var(--color-on-surface)] line-clamp-1">
                        {{ task.title }}
                      </h4>
                      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[var(--color-on-surface-variant)]">
                        <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-[14px]">location_on</span>
                          {{ task.area.name }}
                        </span>
                        <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-[14px]">schedule</span>
                          {{ task.status.name }}
                        </span>
                        @if (task.slaResolutionDueAt) {
                          <span class="flex items-center gap-1" [ngClass]="task.isSlaBreached ? 'text-[var(--color-error)]' : ''">
                            <span class="material-symbols-outlined text-[14px]">timer</span>
                            Due {{ formatSlaDue(task.slaResolutionDueAt) }}
                          </span>
                        }
                      </div>
                    </div>

                    <!-- Time & Action -->
                    <div class="flex shrink-0 flex-col items-end gap-2">
                      <span class="text-[11px] text-[var(--color-on-surface-variant)]">
                        {{ formatTimeAgo(task.reportedAt) }}
                      </span>
                      <button
                        class="flex items-center gap-1 rounded-full bg-[var(--color-primary-container)] px-3 py-1 text-[11px] font-medium text-[var(--color-on-primary-container)] transition-colors hover:bg-[var(--color-primary)]/20"
                      >
                        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
                        View
                      </button>
                    </div>
                  </a>
                }
              }
            </div>
          </section>
        </div>

        <!-- Right Column: Map Widget & Recent Activity -->
        <div class="flex flex-col gap-6">
          <!-- Map Widget -->
          <section
            class="relative h-[300px] overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] shadow-sm"
          >
            @if (isLoadingMap()) {
              <div
                class="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-dim)]"
              >
                <div class="flex flex-col items-center gap-2">
                  <span
                    class="material-symbols-outlined animate-spin text-3xl text-[var(--color-primary)]"
                  >
                    progress_activity
                  </span>
                  <span class="text-[12px] text-[var(--color-on-surface-variant)]"
                    >Loading map...</span
                  >
                </div>
              </div>
            }
            <div #mapContainer class="z-0 h-full w-full"></div>
            <!-- Map Overlay/Controls -->
            <div class="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
              <div class="pointer-events-auto flex items-center justify-between">
                <div
                  class="rounded-md bg-white/70 px-2 py-1 text-[11px] font-medium text-[var(--color-on-surface)] shadow-sm backdrop-blur-md"
                >
                  Active Issues: {{ mapIssues().length }}
                </div>
                <button
                  (click)="centerOnUserLocation()"
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 shadow-sm transition-colors hover:bg-white/90"
                >
                  <span class="material-symbols-outlined text-[18px]">my_location</span>
                </button>
              </div>
              <!-- Info Box -->
              <div
                class="pointer-events-auto flex items-center gap-2 rounded-lg bg-white/70 p-3 shadow-sm backdrop-blur-md"
              >
                <span class="material-symbols-outlined text-[var(--color-primary)]"
                  >my_location</span
                >
                <div>
                  <p class="text-[12px] font-medium text-[var(--color-on-surface)]">
                    {{ dashboardSummary()?.departmentName || 'Your Area' }}
                  </p>
                  <p class="text-[11px] text-[var(--color-on-surface-variant)]">
                    {{ mapIssues().length }} Active Incidents
                  </p>
                </div>
              </div>
            </div>
          </section>

          <!-- Recent Activity Feed -->
          <section
            class="flex-1 overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] shadow-sm"
          >
            <div
              class="border-b border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-bright)] px-6 py-4"
            >
              <h3 class="text-[18px] font-semibold text-[var(--color-on-surface)]">
                Recent Activity
              </h3>
            </div>
            <div class="flex flex-col gap-4 p-4">
              @if (isLoadingActivities()) {
                @for (i of [1, 2, 3]; track i) {
                  <div class="flex gap-4">
                    <div class="mt-1">
                      <div
                        class="h-2 w-2 animate-pulse rounded-full bg-[var(--color-surface-dim)]"
                      ></div>
                    </div>
                    <div class="flex-1">
                      <div
                        class="mb-1 h-4 w-3/4 animate-pulse rounded bg-[var(--color-surface-dim)]"
                      ></div>
                      <div
                        class="h-3 w-20 animate-pulse rounded bg-[var(--color-surface-dim)]"
                      ></div>
                    </div>
                  </div>
                }
              } @else if (recentActivities().length === 0) {
                <div class="flex flex-col items-center justify-center py-8 text-center">
                  <span class="material-symbols-outlined text-3xl text-[var(--color-outline)]"
                    >history</span
                  >
                  <p class="mt-2 text-[12px] text-[var(--color-on-surface-variant)]">
                    No recent activity
                  </p>
                </div>
              } @else {
                @for (
                  activity of recentActivities().slice(0, 5);
                  track activity.activityId;
                  let last = $last
                ) {
                  <div class="flex gap-4">
                    <div class="mt-1">
                      <div
                        class="h-2 w-2 rounded-full"
                        [ngClass]="getActivityDotClass(activity.activityType)"
                      ></div>
                      @if (!last) {
                        <div
                          class="mx-auto mt-1 h-full w-px bg-[var(--color-outline-variant)]/50"
                        ></div>
                      }
                    </div>
                    <div
                      class="flex-1 pb-4"
                      [ngClass]="{'border-b border-[var(--color-outline-variant)]/30': !last}"
                    >
                      <p class="text-[14px] text-[var(--color-on-surface)]">
                        @if (activity.actorName) {
                          <span class="font-semibold">{{ activity.actorName }}</span>
                        }
                        @switch (activity.activityType) {
                          @case ('ASSIGNMENT') {
                            assigned incident
                          }
                          @case ('STATUS_CHANGE') {
                            updated incident
                          }
                          @case ('RESOLVED') {
                            resolved incident
                          }
                          @case ('COMMENT') {
                            commented on
                          }
                          @case ('CREATED') {
                            reported incident
                          }
                          @default {
                            updated
                          }
                        }
                        <a
                          [routerLink]="['/staff/incidents', activity.issueId]"
                          class="text-[var(--color-primary)] hover:underline"
                        >
                          {{ activity.issuePublicCode }}
                        </a>
                        @if (activity.description) {
                          <span class="text-[var(--color-on-surface-variant)]">
                            - {{ activity.description | slice: 0 : 50 }}</span
                          >
                        }
                      </p>
                      <p class="mt-1 text-[11px] text-[var(--color-on-surface-variant)]">
                        {{ formatTimeAgo(activity.activityTimestamp) }}
                      </p>
                    </div>
                  </div>
                }
              }
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .material-symbols-outlined {
        font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 24;
      }

      :host ::ng-deep .leaflet-container {
        height: 100%;
        width: 100%;
        background: #e5e5e5;
      }

      :host ::ng-deep .leaflet-control-attribution {
        font-size: 9px;
      }
    `,
  ],
})
export class StaffHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>

  private readonly staffService = inject(StaffService)
  private readonly authStore = inject(AuthStore)
  private map!: L.Map
  private issueMarkers: L.Marker[] = []
  private userLocation = { lat: 10.7769, lng: 106.7009 }

  // Loading states
  isLoadingSummary = signal(true)
  isLoadingTasks = signal(true)
  isLoadingActivities = signal(true)
  isLoadingMap = signal(true)

  // Data signals
  dashboardSummary = signal<StaffDashboardSummaryResponse | null>(null)
  myTasks = signal<StaffTaskResponse[]>([])
  recentActivities = signal<StaffActivityResponse[]>([])
  mapIssues = signal<StaffMapIssueResponse[]>([])

  ngOnInit(): void {
    this.loadDashboardData()
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 100)
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove()
    }
  }

  private loadDashboardData(): void {
    // Load dashboard summary
    this.isLoadingSummary.set(true)
    this.staffService.getDashboardSummary().subscribe({
      next: (data) => {
        this.dashboardSummary.set(data)
        this.isLoadingSummary.set(false)
      },
      error: (err) => {
        console.error('Failed to load dashboard summary:', err)
        this.isLoadingSummary.set(false)
      },
    })

    // Load my tasks
    this.isLoadingTasks.set(true)
    this.staffService.getMyTasks().subscribe({
      next: (data) => {
        this.myTasks.set(data)
        this.isLoadingTasks.set(false)
      },
      error: (err) => {
        console.error('Failed to load tasks:', err)
        this.isLoadingTasks.set(false)
      },
    })

    // Load recent activities
    this.isLoadingActivities.set(true)
    this.staffService.getRecentActivities().subscribe({
      next: (data) => {
        this.recentActivities.set(data)
        this.isLoadingActivities.set(false)
      },
      error: (err) => {
        console.error('Failed to load activities:', err)
        this.isLoadingActivities.set(false)
      },
    })
  }

  private initMap(): void {
    const container = this.mapContainer?.nativeElement
    if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
      setTimeout(() => this.initMap(), 100)
      return
    }

    this.map = L.map(container, {
      center: [this.userLocation.lat, this.userLocation.lng],
      zoom: 13,
      zoomControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map)

    this.requestUserLocation()
  }

  private requestUserLocation(): void {
    if (!navigator.geolocation) {
      this.loadMapIssues()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        this.userLocation = { lat: latitude, lng: longitude }
        this.map.setView([latitude, longitude], 13)
        this.addUserLocationMarker()
        this.loadMapIssues()
      },
      () => {
        this.loadMapIssues()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }

  centerOnUserLocation(): void {
    this.requestUserLocation()
  }

  private loadMapIssues(): void {
    this.isLoadingMap.set(true)
    this.staffService.getMapIssues().subscribe({
      next: (issues) => {
        this.mapIssues.set(issues)
        this.addIssueMarkers(issues)
        this.isLoadingMap.set(false)
      },
      error: (err) => {
        console.error('Failed to load map issues:', err)
        this.isLoadingMap.set(false)
      },
    })
  }

  private addUserLocationMarker(): void {
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 16px;
          height: 16px;
          background-color: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        "></div>
        <div style="
          width: 32px;
          height: 32px;
          background-color: rgba(59,130,246,0.2);
          border-radius: 50%;
          position: absolute;
          top: -8px;
          left: -8px;
          animation: pulse 2s infinite;
        "></div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })

    L.marker([this.userLocation.lat, this.userLocation.lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup('<strong>Your Location</strong>')
  }

  private addIssueMarkers(issues: StaffMapIssueResponse[]): void {
    // Clear existing markers
    this.issueMarkers.forEach((m) => m.remove())
    this.issueMarkers = []

    issues.forEach((issue) => {
      if (!issue.latitude || !issue.longitude) return

      const markerColor = this.getTypeColor(issue.issueType.code)
      const isBreached = issue.isSlaBreached

      const icon = L.divIcon({
        html: `<div style="
          background-color: ${markerColor};
          width: ${isBreached ? '20px' : '16px'};
          height: ${isBreached ? '20px' : '16px'};
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ${isBreached ? 'animation: pulse 1.5s infinite;' : ''}
        "></div>`,
        className: '',
        iconSize: [isBreached ? 20 : 16, isBreached ? 20 : 16],
        iconAnchor: [isBreached ? 10 : 8, isBreached ? 10 : 8],
      })

      const marker = L.marker([issue.latitude, issue.longitude], { icon })
        .addTo(this.map)
        .bindPopup(`<strong>${issue.publicCode}</strong><br/>${issue.title}`)

      marker.on('click', () => {
        // Could navigate to detail page
      })

      this.issueMarkers.push(marker)
    })
  }

  private getTypeColor(typeCode: string): string {
    return (
      DEFAULT_ISSUE_TYPE_COLORS[typeCode?.toUpperCase() || ''] ||
      DEFAULT_ISSUE_TYPE_COLORS['DEFAULT']
    )
  }

  userName(): string {
    const user = this.authStore.user()
    return user?.fullName?.split(' ')[0] || 'Staff'
  }

  formatTimeAgo(date: Date | string): string {
    return this.staffService.formatTimeAgo(date)
  }

  getPriorityClass(priorityCode: string): string {
    return this.staffService.getPriorityClass(priorityCode)
  }

  getActivityDotClass(activityType: string): string {
    return this.staffService.getActivityDotColor(activityType)
  }

  getPriorityBgClass(priorityCode: string): string {
    const code = priorityCode?.toUpperCase() || ''
    if (code === 'CRITICAL') return 'bg-[var(--color-error-container)]'
    if (code === 'HIGH') return 'bg-[var(--color-tertiary-fixed)]/20'
    if (code === 'MEDIUM') return 'bg-[var(--color-primary-fixed)]/20'
    return 'bg-[var(--color-surface-variant)]'
  }

  getPriorityIconColorClass(priorityCode: string): string {
    const code = priorityCode?.toUpperCase() || ''
    if (code === 'CRITICAL') return 'text-[var(--color-error)]'
    if (code === 'HIGH') return 'text-[var(--color-tertiary-container)]'
    if (code === 'MEDIUM') return 'text-[var(--color-primary)]'
    return 'text-[var(--color-on-surface-variant)]'
  }

  getPriorityIcon(priorityCode: string): string {
    const code = priorityCode?.toUpperCase() || ''
    if (code === 'CRITICAL') return 'priority_high'
    if (code === 'HIGH') return 'keyboard_double_arrow_up'
    if (code === 'MEDIUM') return 'remove'
    return 'keyboard_double_arrow_down'
  }

  getPriorityBadgeClass(priorityCode: string): string {
    const code = priorityCode?.toUpperCase() || ''
    if (code === 'CRITICAL') return 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
    if (code === 'HIGH') return 'bg-[var(--color-tertiary-fixed)]/20 text-[var(--color-on-tertiary-fixed)]'
    if (code === 'MEDIUM') return 'bg-[var(--color-primary-fixed)]/20 text-[var(--color-on-primary-fixed)]'
    return 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]'
  }

  formatSlaDue(dateStr: string): string {
    const due = new Date(dateStr)
    const now = new Date()
    const diffMs = due.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffMs < 0) {
      const absHours = Math.abs(diffHours)
      if (absHours >= 24) return `${Math.abs(diffDays)}d overdue`
      return `${absHours}h overdue`
    }
    if (diffHours >= 24) return `in ${diffDays}d`
    if (diffHours > 0) return `in ${diffHours}h`
    return 'due now'
  }
}
