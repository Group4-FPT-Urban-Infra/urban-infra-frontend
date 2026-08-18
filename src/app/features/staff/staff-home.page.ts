import { Component, inject, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, effect } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AuthStore } from '../../core/auth/auth.store'
import { StaffStore } from './staff.store'
import { RouterLink } from '@angular/router'
import { StaffTask } from './staff.types'
import * as L from 'leaflet'

// Fix Leaflet default icon paths to prevent 404 errors
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

@Component({
  selector: 'app-staff-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[var(--color-surface)] p-4 md:p-8">
      <!-- Page Header -->
      @if (store.error()) {
        <div class="mb-4 rounded-md bg-red-100 p-4 text-red-700">{{ store.error() }}</div>
      }
      <header class="mb-6 flex items-end justify-between">
        <div>
          <h2 class="text-[36px] font-bold text-[var(--color-on-surface)]" style="letter-spacing: -0.02em; line-height: 44px;">
            Good Morning, {{ userName() }}
          </h2>
          <p class="mt-1 text-[14px] text-[var(--color-on-surface-variant)]">
            Here is your daily incident overview for District 4.
          </p>
        </div>
        <!-- Removed unused Filter/Export buttons as per stabilization goals -->
      </header>

      <!-- Metrics Bento Grid -->
      @if (store.loading().dashboard) {
        <!-- Skeleton Loader for KPIs -->
        <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="h-[136px] animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
          }
        </div>
      } @else if (store.dashboardSummary(); as summary) {
      <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <!-- Assigned Incidents -->
        <div class="flex flex-col justify-between rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div class="mb-4 flex items-start justify-between">
            <span class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Assigned Incidents
            </span>
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-fixed)]/20 text-[var(--color-primary)]">
              <span class="material-symbols-outlined text-[20px]">assignment_ind</span>
            </div>
          </div>
          <div>
            <h3 class="text-[28px] font-bold text-[var(--color-on-surface)]">{{ summary.assignedTasks }}</h3>
            <p class="mt-1 text-[11px] font-medium text-[var(--color-on-surface-variant)]">
              Tasks assigned to you
            </p>
          </div>
        </div>

        <!-- High Priority Tasks -->
        <div class="flex flex-col justify-between rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div class="mb-4 flex items-start justify-between">
            <span class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              High Priority Tasks
            </span>
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-error-container)] text-[var(--color-on-error-container)]">
              <span class="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div>
            <h3 class="text-[28px] font-bold text-[var(--color-on-surface)]">{{ summary.highPriorityTasks }}</h3>
            <p class="mt-1 text-[11px] font-medium text-[var(--color-on-surface-variant)]">
              Require immediate attention
            </p>
          </div>
        </div>

        <!-- Avg Resolution Time -->
        <div class="flex flex-col justify-between rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div class="mb-4 flex items-start justify-between">
            <span class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Avg Resolution Time
            </span>
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-tertiary-fixed)]/20 text-[var(--color-tertiary-container)]">
              <span class="material-symbols-outlined text-[20px]">timer</span>
            </div>
          </div>
          <div>
            <h3 class="text-[28px] font-bold text-[var(--color-on-surface)]">{{ summary.avgResolutionTimeHours }}h</h3>
            <p class="mt-1 text-[11px] font-medium text-[var(--color-on-surface-variant)]">
              Average time to resolve
            </p>
          </div>
        </div>

        <!-- Pending Verifications -->
        <div class="flex flex-col justify-between rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div class="mb-4 flex items-start justify-between">
            <span class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Pending Verifications
            </span>
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]">
              <span class="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
          </div>
          <div>
            <h3 class="text-[28px] font-bold text-[var(--color-on-surface)]">{{ summary.pendingVerifications }}</h3>
            <p class="mt-1 text-[11px] font-medium text-[var(--color-on-surface-variant)]">
              Requires field inspection
            </p>
          </div>
        </div>
      </div>
      }

      <!-- Main Grid Layout -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Left Column: Priority Tasks & Activity -->
        <div class="flex flex-col gap-6 lg:col-span-2">
          <!-- Priority Inbox -->
          <section class="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] shadow-sm">
            <div class="flex items-center justify-between border-b border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-bright)] px-6 py-4">
              <h3 class="text-[18px] font-semibold text-[var(--color-on-surface)]">Priority Tasks</h3>
              <a routerLink="/staff/incidents" class="text-[12px] font-medium text-[var(--color-primary)] hover:underline">
                View All
              </a>
            </div>
            <div class="flex-1 overflow-y-auto">
              @if (store.loading().dashboard) {
                <div class="p-4 text-center text-sm text-[var(--color-on-surface-variant)]">Loading tasks...</div>
              } @else if (store.myTasks().length === 0) {
                <div class="p-4 text-center text-sm text-[var(--color-on-surface-variant)]">No tasks assigned to you.</div>
              } @else {
                @for (task of store.myTasks(); track task.id; let last = $last) {
                  <div class="group cursor-pointer p-4 transition-colors hover:bg-[var(--color-surface-container-low)]" [class.border-b]="!last" [class.border-[var(--color-outline-variant)]/50]="!last">
                    <div class="mb-2 flex items-start justify-between">
                      <div class="flex items-center gap-2">
                        <span class="rounded-full px-2 py-0.5 text-[11px] font-medium" [ngClass]="getPriorityClass(task.priority)">{{ task.priority }}</span>
                        <span class="text-[11px] text-[var(--color-on-surface-variant)]">{{ task.id }}</span>
                      </div>
                      <span class="text-[11px] text-[var(--color-on-surface-variant)]">{{ task.assignedAt | date:'shortTime' }}</span>
                    </div>
                    <h4 class="mb-2 text-[16px] font-semibold text-[var(--color-on-surface)]">
                      {{ task.title }}
                    </h4>
                    <p class="mb-3 line-clamp-1 text-[14px] text-[var(--color-on-surface-variant)]">
                      {{ task.location }}
                    </p>
                    <div class="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button class="rounded bg-[var(--color-primary)] px-3 py-1 text-[11px] font-medium text-white hover:bg-[var(--color-primary)]/90">
                        Update Status
                      </button>
                      <a [routerLink]="['/staff/incidents', task.id.replace('INC-', '')]" class="rounded bg-[var(--color-surface-variant)] px-3 py-1 text-[11px] font-medium text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-dim)]">
                        View Details
                      </a>
                    </div>
                  </div>
                }
              }
            </div>
          </section>
        </div>

        <!-- Right Column: Map Widget & Recent Activity -->
        <div class="flex flex-col gap-6">
          <!-- Map Widget -->
          <section class="relative h-[300px] overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] shadow-sm">
            <div #dashboardMap class="h-full w-full bg-gray-200"></div>
            <!-- Map Overlay/Controls -->
            <div class="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
              <div class="flex items-center justify-between">
                <div class="rounded-md bg-white/70 px-2 py-1 text-[11px] font-medium text-[var(--color-on-surface)] shadow-sm backdrop-blur-md">
                  District 4 Overview
                </div>
                <a routerLink="/staff/map" class="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/70 shadow-sm transition-colors hover:bg-white/90">
                  <span class="material-symbols-outlined text-[18px]">fullscreen</span>
                </a>
              </div>
              <!-- Info Box -->
              <div class="flex items-center gap-2 rounded-lg bg-white/70 p-3 shadow-sm backdrop-blur-md">
                <span class="material-symbols-outlined text-[var(--color-primary)]">my_location</span>
                <div>
                  <p class="text-[12px] font-medium text-[var(--color-on-surface)]">Map of Assigned Tasks</p>
                  <p class="text-[11px] text-[var(--color-on-surface-variant)]">{{ mapMessage }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Recent Activity Feed -->
          <section class="flex-1 overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] shadow-sm">
            <div class="border-b border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-bright)] px-6 py-4">
              <h3 class="text-[18px] font-semibold text-[var(--color-on-surface)]">Recent Activity</h3>
            </div>
            @if (store.loading().dashboard) {
              <div class="p-4 text-center text-sm text-[var(--color-on-surface-variant)]">Loading activities...</div>
            } @else if (store.recentActivities().length === 0) {
              <div class="p-4 text-center text-sm text-[var(--color-on-surface-variant)]">No recent activity.</div>
            } @else {
              <div class="flex flex-col gap-4 p-4">
                @for (activity of store.recentActivities(); track activity.id; let last = $last) {
                  <div class="flex gap-4">
                    <div class="mt-1">
                      <div class="h-2 w-2 rounded-full bg-[var(--color-secondary-container)] ring-4 ring-[var(--color-secondary-container)]/20"></div>
                      @if (!last) {
                        <div class="mx-auto mt-1 h-full w-px bg-[var(--color-outline-variant)]/50"></div>
                      }
                    </div>
                    <div class="flex-1" [class.border-b]="!last" [class.border-[var(--color-outline-variant)]/30]="!last" [class.pb-4]="!last">
                      <p class="text-[14px] text-[var(--color-on-surface)]">
                        <span class="font-semibold">{{ activity.actorName }}</span> {{ activity.action }} incident
                        <a [routerLink]="['/staff/incidents', activity.issueId.replace('INC-', '')]" class="text-[var(--color-primary)] hover:underline">{{ activity.issueId }}</a>.
                      </p>
                      <p class="mt-1 text-[11px] text-[var(--color-on-surface-variant)]">{{ activity.createdAt | date:'short' }}</p>
                    </div>
                  </div>
                }
              </div>
          }
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
    `,
  ],
})
export class StaffHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dashboardMap', { static: true }) private mapContainer!: ElementRef<HTMLDivElement>
  private map!: L.Map
  private userLocationMarker: L.Marker | null = null
  private markersLayer = L.layerGroup()
  protected mapMessage = 'Loading map data...'

  protected readonly authStore = inject(AuthStore)
  protected readonly store = inject(StaffStore)

  constructor() {
    effect(() => {
      // This effect will run whenever the tasks from the store change.
      const tasks = this.store.myTasks()
      if (this.map) {
        this.updateMapMarkers(tasks)
      }
    })
  }

  ngOnInit(): void {
     this.store.loadDashboardData() // Tạm thời comment lại để phát triển UI mà không cần đăng nhập
  }

  ngAfterViewInit(): void {
    this.initMap()
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove()
    }
  }

  private initMap(): void {
    // A small delay to ensure the container is rendered before map initialization.
    setTimeout(() => {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [10.7769, 106.7009], // Default to HCMC, District 1
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      })
      this.markersLayer.addTo(this.map)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(this.map)

      // Initial marker update in case data is already loaded
      this.updateMapMarkers(this.store.myTasks())

      // Get user's current location and center the map
      this.requestUserLocation()
    }, 100)
  }

  private updateMapMarkers(tasks: StaffTask[]): void {
    this.markersLayer.clearLayers()

    const tasksWithCoords = tasks.filter(
      (task) => task.latitude != null && task.longitude != null,
    )

    if (tasksWithCoords.length === 0) {
      this.mapMessage = 'No tasks with coordinates to display.'
      return
    }

    this.mapMessage = `${tasksWithCoords.length} tasks shown on map.`
    const markers: L.Marker[] = []
    tasksWithCoords.forEach((task) => {
      const marker = L.marker([task.latitude!, task.longitude!]).bindPopup(
        `<b>${task.id}</b><br>${task.title}`,
      )
      markers.push(marker)
    })

    markers.forEach((marker) => this.markersLayer.addLayer(marker))

    if (markers.length > 0) {
      const group = L.featureGroup(markers)
      this.map.fitBounds(group.getBounds().pad(0.2))
    }
  }

  private requestUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLatLng: L.LatLngTuple = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          this.map.setView(userLatLng, 15); // Center map on user

          // Add a marker for the user's location
          if (this.userLocationMarker) {
            this.userLocationMarker.setLatLng(userLatLng);
          } else {
            this.userLocationMarker = L.marker(userLatLng, {
              icon: L.divIcon({
                className: 'h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg',
                html: '',
              }),
            }).addTo(this.map).bindPopup('Vị trí hiện tại của bạn');
          }
        },
        () => {
          // Could not get location. Map remains at default center.
          console.warn('Could not get user location for dashboard map.');
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    }
  }

  userName(): string {
    const user = this.authStore.user()
    return user?.fullName?.split(' ')[0] || 'Alex'
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Critical':
        return 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
      case 'High':
        return 'bg-[var(--color-tertiary-fixed)] text-[var(--color-on-tertiary-fixed)]'
      case 'Medium':
        return 'bg-[var(--color-primary-fixed)] text-[var(--color-on-primary-fixed)]'
      case 'Low':
        return 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]'
      default:
        return 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]'
    }
  }
}
