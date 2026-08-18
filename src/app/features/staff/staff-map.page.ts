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
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import * as L from 'leaflet'
import { StaffService } from './staff.service'
import { StaffStore } from './staff.store'
import type { StaffMapIssue, StaffApiFilters } from './staff.types'

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

const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#fbbf24', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f43f5e', '#78716c', '#6b7280', '#1e293b',
]

interface LookupItem {
  id: number | string
  code: string
  name: string
}

@Component({
  selector: 'app-staff-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative h-screen w-full overflow-hidden">
      <!-- Search Bar (Top Left) -->
      <div class="absolute left-4 top-4 z-20 w-[380px]">
        <div
          class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 p-2 shadow-md backdrop-blur-xl"
        >
          <span class="material-symbols-outlined ml-2 text-[var(--color-outline)]">search</span>
          <input
            type="text"
            class="flex-1 border-none bg-transparent py-1 text-[14px] text-[var(--color-on-surface)] placeholder:text-[var(--color-outline-variant)] focus:outline-none focus:ring-0"
            placeholder="Search incident code, title, address..."
            [(ngModel)]="searchQuery"
            (keyup.enter)="applyFilters()"
          />
          @if (searchQuery) {
            <button (click)="searchQuery = ''; applyFilters()" class="text-[var(--color-outline)]">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          }
        </div>
      </div>

      <!-- Quick Staff Toggle Bar (Top Center) -->
      <div class="absolute left-1/2 top-4 z-20 -translate-x-1/2 flex items-center gap-2 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 p-1.5 shadow-md backdrop-blur-xl">
        <button
          (click)="toggleMyTasks()"
          [class]="filters.onlyMine
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
            : 'bg-transparent text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'"
          class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all"
        >
          <span class="material-symbols-outlined text-[16px]">assignment_ind</span>
          My Tasks Only
        </button>

        <button
          (click)="toggleCriticalSla()"
          [class]="filters.nearBreachOnly
            ? 'bg-[var(--color-error)] text-white'
            : 'bg-transparent text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'"
          class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all"
        >
          <span class="material-symbols-outlined text-[16px]">timer_off</span>
          Near SLA Breach
        </button>
      </div>

      <!-- Filter Sidebar (Top Right) -->
      <div
        class="absolute right-4 top-4 z-20 flex w-[320px] max-h-[calc(100vh-32px)] flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 shadow-xl backdrop-blur-xl"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[var(--color-primary)]">tune</span>
            <h2 class="text-[16px] font-semibold text-[var(--color-on-surface)]">Staff Map Filters</h2>
          </div>
          <button (click)="clearAllFilters()" class="text-[12px] font-medium text-[var(--color-primary)] hover:underline">
            Clear All
          </button>
        </div>

        <!-- Filter Content -->
        <div class="filter-scroll flex flex-1 flex-col gap-5 overflow-y-auto p-4">

          <!-- Staff Operational Filters -->
          <div class="flex flex-col gap-2 rounded-lg bg-[var(--color-surface-container-low)] p-3">
            <span class="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)]">Work Queue</span>
            <label class="flex cursor-pointer items-center justify-between text-[13px] text-[var(--color-on-surface)]">
              <span>Assigned to me</span>
              <input type="checkbox" [(ngModel)]="filters.onlyMine" (change)="applyFilters()" class="h-4 w-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
            </label>
            <label class="flex cursor-pointer items-center justify-between text-[13px] text-[var(--color-on-surface)]">
              <span>Unassigned (Open for Claim)</span>
              <input type="checkbox" [(ngModel)]="filters.unassignedOnly" (change)="applyFilters()" class="h-4 w-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
            </label>
          </div>

          <!-- Priority Section -->
          <div class="flex flex-col gap-2">
            <h3 class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">Priority</h3>
            <div class="flex flex-wrap gap-1.5">
              @for (priority of priorities; track priority.code) {
                <button
                  (click)="togglePriority(priority.code)"
                  [style.background-color]="isPrioritySelected(priority.code) ? 'var(--color-primary-container)' : 'var(--color-surface-container)'"
                  [style.color]="isPrioritySelected(priority.code) ? 'var(--color-on-primary-container)' : 'var(--color-on-surface)'"
                  [style.border-color]="isPrioritySelected(priority.code) ? 'var(--color-primary)' : 'var(--color-outline-variant)'"
                  class="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
                >
                  {{ priority.name }}
                </button>
              }
            </div>
          </div>

          <!-- Status Section -->
          <div class="flex flex-col gap-2">
            <h3 class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">Status</h3>
            <div class="flex flex-wrap gap-1.5">
              @for (status of statuses; track status.code) {
                <button
                  (click)="toggleStatus(status.code)"
                  [style.background-color]="isStatusSelected(status.code) ? 'var(--color-error-container)' : 'var(--color-surface-container)'"
                  [style.color]="isStatusSelected(status.code) ? 'var(--color-error)' : 'var(--color-on-surface)'"
                  [style.border-color]="isStatusSelected(status.code) ? 'var(--color-error)' : 'var(--color-outline-variant)'"
                  class="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
                >
                  {{ status.name }}
                </button>
              }
            </div>
          </div>

          <!-- Issue Types -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <h3 class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">Category</h3>
              <button (click)="toggleColorPicker()" class="flex items-center gap-1 text-[11px] text-[var(--color-primary)] hover:underline">
                <span class="material-symbols-outlined text-[14px]">palette</span> Colors
              </button>
            </div>

            @if (showColorPicker && selectedColorType()) {
              <div class="rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] p-3">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-[11px] text-[var(--color-on-surface-variant)]">Color for: {{ selectedColorType()?.name }}</span>
                  <button (click)="toggleColorPicker()" class="text-[var(--color-outline)]">
                    <span class="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
                <div class="grid grid-cols-8 gap-1">
                  @for (color of colorPalette; track color) {
                    <button
                      (click)="setIssueTypeColor(selectedColorType()!.id, color)"
                      class="h-6 w-6 rounded border-2 hover:scale-110 transition-transform"
                      [style.background-color]="color"
                    ></button>
                  }
                </div>
              </div>
            }

            @for (type of issueTypes; track type.id) {
              <label class="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  [checked]="isTypeSelected(type.id)"
                  (change)="toggleType(type.id)"
                  class="h-4 w-4 rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span class="h-3 w-3 rounded-full" [style.background-color]="getIssueTypeColor(type.id, type.code)"></span>
                <span class="flex-1 text-[13px] text-[var(--color-on-surface)]">{{ type.name }}</span>
              </label>
            }
          </div>

          <!-- Date Range -->
          <div class="flex flex-col gap-2">
            <h3 class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">Timeframe</h3>
            <div class="flex gap-1.5">
              <button (click)="setQuickDateRange(1)" [class]="quickDateDays === 1 ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]'" class="flex-1 rounded py-1 text-[11px] font-medium">24h</button>
              <button (click)="setQuickDateRange(7)" [class]="quickDateDays === 7 ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]'" class="flex-1 rounded py-1 text-[11px] font-medium">7d</button>
              <button (click)="setQuickDateRange(30)" [class]="quickDateDays === 30 ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]'" class="flex-1 rounded py-1 text-[11px] font-medium">30d</button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4">
          <button (click)="applyFilters()" class="w-full rounded-lg bg-[var(--color-primary)] py-2 text-[12px] font-medium text-[var(--color-on-primary)] shadow-sm hover:bg-[var(--color-primary)]/90">
            Apply Filters ({{ issues().length }} Found)
          </button>
        </div>
      </div>

      <!-- Legend (Bottom Left) -->
      <div class="absolute bottom-4 left-4 z-10 hidden md:block">
        <div class="flex flex-col gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 p-3 shadow-sm backdrop-blur-md">
          <h4 class="text-[11px] font-bold uppercase tracking-wider text-[var(--color-on-surface)]">Incident Map Legend</h4>
          @for (type of issueTypes; track type.id) {
            <div class="flex items-center gap-2">
              <div class="h-2.5 w-2.5 rounded-full" [style.background-color]="getIssueTypeColor(type.id, type.code)"></div>
              <span class="text-[11px] text-[var(--color-on-surface-variant)]">{{ type.name }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Map Controls (Bottom Right) -->
      <div class="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button (click)="centerOnUserLocation()" class="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 text-[var(--color-on-surface)] shadow-md hover:bg-[var(--color-surface-container)]">
          <span class="material-symbols-outlined text-[20px]">my_location</span>
        </button>
        <div class="overflow-hidden rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 shadow-md">
          <button (click)="zoomIn()" class="flex h-10 w-10 items-center justify-center border-b border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]">
            <span class="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button (click)="zoomOut()" class="flex h-10 w-10 items-center justify-center text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]">
            <span class="material-symbols-outlined text-[20px]">remove</span>
          </button>
        </div>
      </div>

      <!-- Map Leaflet Container -->
      <div #mapContainer class="h-full w-full z-0"></div>

      <!-- Loading overlay -->
      @if (loading()) {
        <div class="absolute inset-0 z-30 flex items-center justify-center bg-[var(--color-surface-container-lowest)]/70 backdrop-blur-sm">
          <div class="flex flex-col items-center gap-2">
            <span class="material-symbols-outlined animate-spin text-4xl text-[var(--color-primary)]">progress_activity</span>
            <p class="text-sm font-medium text-[var(--color-on-surface-variant)]">Loading staff geospatial data...</p>
          </div>
        </div>
      }

      <!-- Issue Detail Drawer / Modal for Staff -->
      @if (selectedIssue()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="closeModal($event)">
          <div class="max-w-lg w-full rounded-2xl bg-[var(--color-surface)] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" (click)="$event.stopPropagation()">
            <!-- Header Image -->
            <div class="relative h-44 bg-[var(--color-surface-dim)] shrink-0">
              @if (selectedIssue()?.thumbnailUrl) {
                <img [src]="selectedIssue()!.thumbnailUrl" [alt]="selectedIssue()!.title" class="h-full w-full object-cover" />
              } @else {
                <div class="flex h-full items-center justify-center text-[var(--color-outline)]">
                  <span class="material-symbols-outlined text-5xl">engineering</span>
                </div>
              }
              <button (click)="closeIssueModal()" class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 z-10">
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
              <span class="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
                {{ selectedIssue()!.status }}
              </span>
            </div>

            <!-- Body Information -->
            <div class="p-6 overflow-y-auto">
              <div class="mb-3">
                <p class="text-xs font-semibold text-[var(--color-primary)]">{{ selectedIssue()!.publicCode || ('INC-' + selectedIssue()!.id) }}</p>
                <h2 class="text-lg font-bold text-[var(--color-on-surface)]">{{ selectedIssue()!.title }}</h2>
              </div>

              <!-- Tags -->
              <div class="mb-4 flex flex-wrap gap-2">
                <span class="rounded bg-[var(--color-surface-container-high)] px-2.5 py-0.5 text-xs text-[var(--color-on-surface-variant)]">
                  {{ selectedIssue()!.category || 'Infrastructure' }}
                </span>
                <span class="rounded bg-[var(--color-error-container)] px-2.5 py-0.5 text-xs text-[var(--color-on-error-container)] font-medium">
                  {{ selectedIssue()!.priority }} Priority
                </span>
              </div>

              <!-- Navigation if multiple issues at coordinate -->
              @if (issuesAtSelectedLocation().length > 1) {
                <div class="mb-4 flex items-center justify-between rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] p-2">
                  <span class="text-xs text-[var(--color-on-surface-variant)]">{{ currentIssueIndex() + 1 }} of {{ issuesAtSelectedLocation().length }} at this point</span>
                  <div class="flex gap-1">
                    <button (click)="navigateIssue(-1)" [disabled]="currentIssueIndex() === 0" class="rounded p-1 text-[var(--color-on-surface)] disabled:opacity-30">
                      <span class="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button (click)="navigateIssue(1)" [disabled]="currentIssueIndex() === issuesAtSelectedLocation().length - 1" class="rounded p-1 text-[var(--color-on-surface)] disabled:opacity-30">
                      <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              }

              <!-- Staff Actions -->
              <div class="mt-4 flex gap-3">
                <button (click)="viewIncidentDetail(selectedIssue()!.id)" class="flex-1 rounded-lg bg-[var(--color-primary)] py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary)]/90">
                  Open Work Order
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      :host ::ng-deep .leaflet-container {
        height: 100%;
        width: 100%;
        background: var(--color-surface-dim, #e5e5e5);
      }
      .filter-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .filter-scroll::-webkit-scrollbar-thumb {
        background-color: var(--color-outline-variant);
        border-radius: 10px;
      }
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
    `,
  ],
})
export class StaffMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>

  private readonly staffService = inject(StaffService)
  private readonly router = inject(Router)

  readonly colorPalette = COLOR_PALETTE

  // Map & Markers
  private map!: L.Map
  private issueMarkers: L.Marker[] = []
  private userLocationMarker: L.Marker | null = null
  private userLocation = { lat: 10.7769, lng: 106.7009 }

  // State Signals
  issues = signal<StaffMapIssue[]>([])
  loading = signal(true)

  // Selected Issue for Modal
  selectedIssue = signal<StaffMapIssue | null>(null)
  issuesAtSelectedLocation = signal<StaffMapIssue[]>([])
  currentIssueIndex = signal(0)

  // Color picker state
  showColorPicker = false
  selectedColorType = signal<LookupItem | null>(null)
  private customColors: Record<string | number, string> = {}

  // Filter Models
  searchQuery = ''
  quickDateDays: number | null = null
  selectedTypeIds = new Set<string | number>()
  selectedStatusCodes = new Set<string>()
  selectedPriorityCodes = new Set<string>()

  filters: StaffApiFilters = {
    onlyMine: true,
    nearBreachOnly: false,
    unassignedOnly: false,
    fromDate: '',
    toDate: '',
  }

  // Lookup data
  readonly priorities: LookupItem[] = [
    { id: 1, code: 'CRITICAL', name: 'Critical' },
    { id: 2, code: 'HIGH', name: 'High' },
    { id: 3, code: 'MEDIUM', name: 'Medium' },
    { id: 4, code: 'LOW', name: 'Low' },
  ]

  readonly statuses: LookupItem[] = [
    { id: 1, code: 'ASSIGNED', name: 'Assigned' },
    { id: 2, code: 'IN_PROGRESS', name: 'In Progress' },
    { id: 3, code: 'PENDING_REVIEW', name: 'Pending Review' },
    { id: 4, code: 'RESOLVED', name: 'Resolved' },
  ]

  readonly issueTypes: LookupItem[] = [
    { id: 1, code: 'POTHOLE', name: 'Road & Pothole' },
    { id: 2, code: 'LIGHT', name: 'Street Light' },
    { id: 3, code: 'FLOOD', name: 'Drainage & Flood' },
    { id: 4, code: 'TRASH', name: 'Sanitation & Trash' },
    { id: 5, code: 'SIGN', name: 'Traffic Sign' },
  ]

  ngOnInit(): void {
    this.issueTypes.forEach((t) => this.selectedTypeIds.add(t.id))
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 100)
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove()
    }
  }

  private initMap(): void {
    const container = this.mapContainer.nativeElement
    if (!container) return

    this.map = L.map(container, {
      center: [this.userLocation.lat, this.userLocation.lng],
      zoom: 14,
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
      this.loadIssues()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const userLatLng: L.LatLngTuple = [this.userLocation.lat, this.userLocation.lng];
        this.map.setView(userLatLng, 14);

        // Add or update the user's location marker
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

        this.loadIssues();
      },
      () => {
        console.warn('Could not get user location for staff map.');
        this.loadIssues(); // Load issues even if location fails
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  }

  loadIssues(): void {
    this.loading.set(true)

    // Build payload filters
    const queryFilters: StaffApiFilters = {
      ...this.filters,
      search: this.searchQuery.trim() || undefined,
      priorities: Array.from(this.selectedPriorityCodes),
      statuses: Array.from(this.selectedStatusCodes),
    }

    // Call internal Staff API
    this.staffService.getStaffMapIssues(queryFilters).subscribe({
      next: (data) => {
        this.issues.set(data)
        this.renderMarkers(data)
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
      },
    })
  }

  private renderMarkers(issues: StaffMapIssue[]): void {
    this.issueMarkers.forEach((m) => m.remove())
    this.issueMarkers = []

    // Group by location
    const groups = new Map<string, StaffMapIssue[]>()
    issues.forEach((issue) => {
      const key = `${issue.latitude.toFixed(5)},${issue.longitude.toFixed(5)}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(issue)
    })

    groups.forEach((groupIssues) => {
      const first = groupIssues[0]
      const markerColor = this.getIssueTypeColor(first.category || 'DEFAULT', first.category || 'DEFAULT')
      const countBadge = groupIssues.length > 1
        ? `<div style="position: absolute; top: -8px; right: -8px; background: #6750A4; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid white;">${groupIssues.length}</div>`
        : ''

      const icon = L.divIcon({
        html: `<div style="position: relative;">${countBadge}<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div></div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([first.latitude, first.longitude], { icon }).addTo(this.map)

      marker.on('click', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e)
        this.issuesAtSelectedLocation.set(groupIssues)
        this.selectedIssue.set(first)
        this.currentIssueIndex.set(0)
      })

      this.issueMarkers.push(marker)
    })
  }

  // Quick Toggles
  toggleMyTasks(): void {
    this.filters.onlyMine = !this.filters.onlyMine
    this.applyFilters()
  }

  toggleCriticalSla(): void {
    this.filters.nearBreachOnly = !this.filters.nearBreachOnly
    this.applyFilters()
  }

  applyFilters(): void {
    this.loadIssues()
  }

  clearAllFilters(): void {
    this.filters = { onlyMine: false, nearBreachOnly: false, unassignedOnly: false }
    this.searchQuery = ''
    this.selectedPriorityCodes.clear()
    this.selectedStatusCodes.clear()
    this.quickDateDays = null
    this.applyFilters()
  }

  // Filter Selection Helpers
  togglePriority(code: string): void {
    if (this.selectedPriorityCodes.has(code)) this.selectedPriorityCodes.delete(code)
    else this.selectedPriorityCodes.add(code)
  }

  isPrioritySelected(code: string): boolean {
    return this.selectedPriorityCodes.has(code)
  }

  toggleStatus(code: string): void {
    if (this.selectedStatusCodes.has(code)) this.selectedStatusCodes.delete(code)
    else this.selectedStatusCodes.add(code)
  }

  isStatusSelected(code: string): boolean {
    return this.selectedStatusCodes.has(code)
  }

  toggleType(id: string | number): void {
    if (this.selectedTypeIds.has(id)) this.selectedTypeIds.delete(id)
    else this.selectedTypeIds.add(id)
  }

  isTypeSelected(id: string | number): boolean {
    return this.selectedTypeIds.has(id)
  }

  setQuickDateRange(days: number): void {
    this.quickDateDays = days
    const now = new Date()
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    this.filters.toDate = now.toISOString()
    this.filters.fromDate = from.toISOString()
    this.applyFilters()
  }

  // Color Customization
  getIssueTypeColor(typeId: string | number, typeCode?: string): string {
    if (this.customColors[typeId]) return this.customColors[typeId]
    const code = (typeCode || String(typeId)).toUpperCase()
    return DEFAULT_ISSUE_TYPE_COLORS[code] || DEFAULT_ISSUE_TYPE_COLORS['DEFAULT']
  }

  setIssueTypeColor(typeId: string | number, color: string): void {
    this.customColors[typeId] = color
    this.renderMarkers(this.issues())
  }

  toggleColorPicker(): void {
    this.showColorPicker = !this.showColorPicker
  }

  // Navigation & Details
  selectIssue(issue: StaffMapIssue): void {
    this.selectedIssue.set(issue)
  }

  navigateIssue(step: number): void {
    const list = this.issuesAtSelectedLocation()
    const nextIdx = this.currentIssueIndex() + step
    if (nextIdx >= 0 && nextIdx < list.length) {
      this.currentIssueIndex.set(nextIdx)
      this.selectedIssue.set(list[nextIdx])
    }
  }

  closeIssueModal(): void {
    this.selectedIssue.set(null)
  }

  closeModal(e: Event): void {
    if ((e.target as HTMLElement).classList.contains('fixed')) {
      this.closeIssueModal()
    }
  }

  viewIncidentDetail(id: string | number): void {
    void this.router.navigate(['/staff/incidents', id])
  }

  centerOnUserLocation(): void {
    this.requestUserLocation()
  }

  zoomIn(): void {
    this.map?.zoomIn()
  }

  zoomOut(): void {
    this.map?.zoomOut()
  }
}