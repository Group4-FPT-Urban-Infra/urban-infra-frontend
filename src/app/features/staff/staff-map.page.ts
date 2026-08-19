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
import { StaffService, StaffMapIssueResponse } from './staff.service'
import { DashboardService, IssueTypeLookup, IssueStatusLookup, IssuePriorityLookup } from '../../core/services/dashboard.service'

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DEFAULT_ISSUE_TYPE_COLORS: Record<string, string> = {
  'LIGHT': '#fbbf24',
  'POTHOLE': '#ef4444',
  'FLOOD': '#3b82f6',
  'TRASH': '#22c55e',
  'SIGN': '#a855f7',
  'DEFAULT': '#6b7280',
}

const STATUS_COLORS: Record<string, string> = {
  'NEW': '#6750A4',
  'IN_PROGRESS': '#625B71',
  'RESOLVED': '#386A20',
  'CLOSED': '#386A20',
  'REJECTED': '#BA1A1A',
}

@Component({
  selector: 'app-staff-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative h-screen w-full overflow-hidden">
      <!-- Filter Sidebar (Top Left) -->
      <div class="absolute left-4 top-4 z-[100] flex w-[320px] max-h-[calc(100vh-32px)] flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 shadow-lg backdrop-blur-xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4">
          <h2 class="text-[18px] font-semibold text-[var(--color-on-surface)]">Map Filters</h2>
          <button (click)="clearAllFilters()" class="text-[12px] font-medium text-[var(--color-primary)] hover:underline">
            Clear All
          </button>
        </div>

        <!-- Filter Content -->
        <div class="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <!-- Scope Filter -->
          <div class="filter-section">
            <h3 class="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">View</h3>
            <div class="flex flex-wrap gap-2">
              @for (option of scopeOptions; track option.value) {
                <button
                  (click)="selectScope(option.value)"
                  class="rounded-full px-4 py-2 text-[12px] font-medium transition-colors"
                  [ngClass]="selectedScope === option.value
                    ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                    : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]'"
                >
                  <span class="material-symbols-outlined text-[14px] mr-1">{{ option.icon }}</span>
                  {{ option.label }}
                </button>
              }
            </div>
          </div>

          <!-- Issue Type Filter -->
          <div class="filter-section">
            <h3 class="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Issue Type</h3>
            @if (isLoadingFilters()) {
              @for (i of [1, 2, 3]; track i) {
                <div class="h-8 w-full animate-pulse rounded bg-[var(--color-surface-dim)] mb-1"></div>
              }
            } @else {
              <div class="flex flex-col gap-2">
                @for (type of issueTypes(); track type.issueTypeId) {
                  <label class="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      [checked]="isTypeSelected(type.issueTypeId)"
                      (change)="toggleType(type.issueTypeId)"
                      class="h-4 w-4 rounded border-[var(--color-outline)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span class="flex items-center gap-2 text-[14px] text-[var(--color-on-surface)]">
                      <span class="h-2 w-2 rounded-full" [style.background-color]="getTypeColor(type.issueTypeId)"></span>
                      {{ type.typeName }}
                    </span>
                  </label>
                }
              </div>
            }
          </div>

          <!-- Status Filter -->
          <div class="filter-section">
            <h3 class="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Status</h3>
            @if (isLoadingFilters()) {
              <div class="h-8 w-full animate-pulse rounded bg-[var(--color-surface-dim)] mb-1"></div>
            } @else {
              <div class="flex flex-wrap gap-2">
                @for (status of issueStatuses(); track status.statusId) {
                  <button
                    (click)="toggleStatus(status.statusCode)"
                    [ngClass]="isStatusSelected(status.statusCode)
                      ? 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)] border-[var(--color-error)]'
                      : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]'"
                    class="flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors"
                  >
                    {{ status.statusName }}
                  </button>
                }
              </div>
            }
          </div>

          <!-- Priority Filter -->
          <div class="filter-section">
            <h3 class="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Priority</h3>
            <div class="flex flex-wrap gap-2">
              @for (priority of priorities; track priority.id) {
                <button
                  (click)="togglePriority(priority.id)"
                  [ngClass]="selectedPriorityIds.includes(priority.id)
                    ? 'text-white'
                    : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface)] border-[var(--color-outline-variant)]'"
                  [style.background-color]="selectedPriorityIds.includes(priority.id) ? priority.color : ''"
                  class="flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors"
                >
                  {{ priority.name }}
                </button>
              }
            </div>
          </div>

          <!-- Search -->
          <div class="filter-section">
            <h3 class="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Search</h3>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)]">search</span>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange()"
                placeholder="Search by code or title..."
                class="w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] py-2 pl-10 pr-3 text-[14px] text-[var(--color-on-surface)] placeholder:text-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4">
          <button
            (click)="applyFilters()"
            [disabled]="isLoading()"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-[14px] font-medium text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
          >
            @if (isLoading()) {
              <span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
            }
            Apply Filters
          </button>
          <p class="mt-2 text-center text-[12px] text-[var(--color-on-surface-variant)]">
            Showing {{ filteredIssues().length }} incidents
          </p>
        </div>
      </div>

      <!-- Map -->
      <div #mapContainer class="h-full w-full z-0"></div>

      <!-- Map Controls (Bottom Right) -->
      <div class="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button
          class="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 text-[var(--color-on-surface)] shadow-lg backdrop-blur-md transition-colors hover:bg-[var(--color-surface-container)]"
          title="My Location"
          (click)="centerOnUserLocation()"
        >
          <span class="material-symbols-outlined text-[24px]">my_location</span>
        </button>
        <div class="overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 shadow-lg backdrop-blur-md">
          <button
            class="flex h-12 w-12 items-center justify-center border-b border-[var(--color-outline-variant)] text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]"
            title="Zoom In"
            (click)="zoomIn()"
          >
            <span class="material-symbols-outlined text-[24px]">add</span>
          </button>
          <button
            class="flex h-12 w-12 items-center justify-center text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]"
            title="Zoom Out"
            (click)="zoomOut()"
          >
            <span class="material-symbols-outlined text-[24px]">remove</span>
          </button>
        </div>
      </div>

      <!-- Legend (Bottom Left) -->
      <div class="absolute bottom-4 left-[340px] z-10">
        <div class="flex flex-col gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 p-3 shadow-sm backdrop-blur-md">
          <h4 class="text-[12px] font-bold text-[var(--color-on-surface)]">Legend</h4>
          <div class="flex items-center gap-3">
            <div class="h-3 w-3 rounded-full bg-[#3b82f6]"></div>
            <span class="text-[11px] text-[var(--color-on-surface-variant)]">Your Location</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="h-3 w-3 animate-pulse rounded-full bg-[#ef4444]"></div>
            <span class="text-[11px] text-[var(--color-on-surface-variant)]">SLA Breached</span>
          </div>
          @for (type of issueTypes().slice(0, 5); track type.issueTypeId) {
            <div class="flex items-center gap-3">
              <div class="h-3 w-3 rounded-full" [style.background-color]="getTypeColor(type.issueTypeId)"></div>
              <span class="text-[11px] text-[var(--color-on-surface-variant)]">{{ type.typeName }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Issue Detail Modal -->
      @if (selectedIssue()) {
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
              <div class="flex h-full items-center justify-center text-[var(--color-outline)]">
                <span class="material-symbols-outlined text-6xl">location_on</span>
              </div>
              <button
                (click)="closeIssueModal()"
                class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
              >
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
              <span
                class="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold"
                [ngClass]="getStatusBadgeClass(selectedIssue()!.status.code)"
              >
                {{ selectedIssue()!.status.name }}
              </span>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto">
              <div class="mb-4">
                <p class="mb-1 text-xs text-[var(--color-primary)] font-medium">
                  {{ selectedIssue()!.publicCode }}
                </p>
                <h2 class="text-xl font-semibold text-[var(--color-on-surface)]">
                  {{ selectedIssue()!.title }}
                </h2>
              </div>

              <div class="mb-4 flex flex-wrap gap-2">
                <span class="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-container)] px-3 py-1 text-xs text-[var(--color-on-surface-variant)]">
                  <span class="material-symbols-outlined text-[14px]">category</span>
                  {{ selectedIssue()!.issueType.name }}
                </span>
                <span
                  class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                  [ngClass]="getPriorityBadgeClass(selectedIssue()!.priority.code)"
                >
                  <span class="material-symbols-outlined text-[14px]">priority_high</span>
                  {{ selectedIssue()!.priority.name }}
                </span>
              </div>

              @if (selectedIssue()!.assignedDepartment) {
                <div class="mb-4 flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)]">
                  <span class="material-symbols-outlined text-[16px]">business</span>
                  {{ selectedIssue()!.assignedDepartment!.name }}
                </div>
              }

              @if (selectedIssue()!.isSlaBreached) {
                <div class="mb-4 flex items-center gap-2 rounded-lg bg-[var(--color-error-container)] p-3 text-sm text-[var(--color-on-error-container)]">
                  <span class="material-symbols-outlined text-[20px]">warning</span>
                  <span class="font-medium">SLA Breached</span>
                </div>
              }

              <!-- View details button -->
              <div class="mt-6 border-t border-[var(--color-outline-variant)] pt-4">
                <button
                  (click)="viewIncidentDetails()"
                  class="w-full rounded-lg bg-[var(--color-primary)] py-3 text-sm font-medium text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary)]/90"
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Loading overlay -->
      @if (isLoading()) {
        <div
          class="absolute inset-0 z-30 flex items-center justify-center bg-[var(--color-surface-container-lowest)]/80 backdrop-blur-sm pointer-events-none"
        >
          <div class="flex flex-col items-center gap-2 rounded-xl bg-[var(--color-surface)]/90 p-4 shadow-lg">
            <span class="material-symbols-outlined animate-spin text-4xl text-[var(--color-primary)]">
              progress_activity
            </span>
            <p class="text-sm text-[var(--color-on-surface-variant)]">Loading incidents...</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      vertical-align: middle;
    }
  `],
})
export class StaffMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>

  private readonly staffService = inject(StaffService)
  private readonly dashboardService = inject(DashboardService)
  private readonly router = inject(Router)

  private map!: L.Map
  private issueMarkers: L.Marker[] = []
  private userLocation = { lat: 10.7769, lng: 106.7009 }

  // Data signals
  issues = signal<StaffMapIssueResponse[]>([])
  filteredIssues = signal<StaffMapIssueResponse[]>([])
  selectedIssue = signal<StaffMapIssueResponse | null>(null)
  isLoading = signal(false)
  isLoadingFilters = signal(true)

  // Filter lookups
  issueTypes = signal<IssueTypeLookup[]>([])
  issueStatuses = signal<IssueStatusLookup[]>([])
  priorities = [
    { id: 1, name: 'Critical', color: '#F44336' },
    { id: 2, name: 'High', color: '#FF9800' },
    { id: 3, name: 'Medium', color: '#FFC107' },
    { id: 4, name: 'Low', color: '#4CAF50' },
  ]

  // Filter selections
  selectedScope = 'department'
  selectedTypeIds: number[] = []
  selectedStatusCodes: string[] = []
  selectedPriorityIds: number[] = []
  searchQuery = ''

  scopeOptions = [
    { label: 'My Issues', value: 'my', icon: 'person' },
    { label: 'Department', value: 'department', icon: 'groups' },
    { label: 'All', value: 'all', icon: 'public' },
  ]

  ngOnInit(): void {
    this.loadFilterData()
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 100)
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove()
    }
  }

  private loadFilterData(): void {
    this.isLoadingFilters.set(true)

    this.dashboardService.getIssueTypes().subscribe({
      next: (types) => {
        this.issueTypes.set(types)
        types.forEach(t => this.selectedTypeIds.push(t.issueTypeId))
      },
      error: (err) => console.error('Error loading issue types:', err)
    })

    this.dashboardService.getIssueStatuses().subscribe({
      next: (statuses) => {
        this.issueStatuses.set(statuses)
        this.isLoadingFilters.set(false)
      },
      error: (err) => {
        console.error('Error loading issue statuses:', err)
        this.isLoadingFilters.set(false)
      }
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
      this.loadIssues()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        this.userLocation = { lat: latitude, lng: longitude }
        this.map.setView([latitude, longitude], 13)
        this.addUserLocationMarker()
        this.loadIssues()
      },
      () => {
        this.loadIssues()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    )
  }

  centerOnUserLocation(): void {
    this.requestUserLocation()
  }

  zoomIn(): void {
    if (this.map) this.map.zoomIn()
  }

  zoomOut(): void {
    if (this.map) this.map.zoomOut()
  }

  selectScope(value: string): void {
    this.selectedScope = value
    this.applyFilters()
  }

  isTypeSelected(typeId: number): boolean {
    return this.selectedTypeIds.includes(typeId)
  }

  toggleType(typeId: number): void {
    const index = this.selectedTypeIds.indexOf(typeId)
    if (index >= 0) {
      this.selectedTypeIds.splice(index, 1)
    } else {
      this.selectedTypeIds.push(typeId)
    }
  }

  isStatusSelected(statusCode: string): boolean {
    return this.selectedStatusCodes.includes(statusCode.toUpperCase())
  }

  toggleStatus(statusCode: string): void {
    const code = statusCode.toUpperCase()
    const index = this.selectedStatusCodes.indexOf(code)
    if (index >= 0) {
      this.selectedStatusCodes.splice(index, 1)
    } else {
      this.selectedStatusCodes.push(code)
    }
  }

  togglePriority(priorityId: number): void {
    const index = this.selectedPriorityIds.indexOf(priorityId)
    if (index >= 0) {
      this.selectedPriorityIds.splice(index, 1)
    } else {
      this.selectedPriorityIds.push(priorityId)
    }
  }

  onSearchChange(): void {
    // Debounce could be added here
  }

  clearAllFilters(): void {
    this.selectedScope = 'department'
    this.selectedTypeIds = []
    this.issueTypes().forEach(t => this.selectedTypeIds.push(t.issueTypeId))
    this.selectedStatusCodes = []
    this.selectedPriorityIds = []
    this.searchQuery = ''
    this.applyFilters()
  }

  applyFilters(): void {
    this.loadIssues()
  }

  private loadIssues(): void {
    this.isLoading.set(true)

    this.staffService.getMapIssues({
      scope: this.selectedScope as 'my' | 'department' | 'all',
      statusCodes: this.selectedStatusCodes.length > 0 ? this.selectedStatusCodes : undefined,
      priorityIds: this.selectedPriorityIds.length > 0 ? this.selectedPriorityIds : undefined,
      issueTypeIds: this.selectedTypeIds.length > 0 && this.selectedTypeIds.length < this.issueTypes().length
        ? this.selectedTypeIds
        : undefined,
      keyword: this.searchQuery || undefined,
      radiusMeters: 10000, // 10km
      latitude: this.userLocation.lat,
      longitude: this.userLocation.lng,
    }).subscribe({
      next: (issues) => {
        this.issues.set(issues)
        this.filteredIssues.set(issues)
        this.addIssueMarkers(issues)
        this.isLoading.set(false)
      },
      error: (err) => {
        console.error('Failed to load issues:', err)
        this.isLoading.set(false)
      },
    })
  }

  private addUserLocationMarker(): void {
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 20px;
          height: 20px;
          background-color: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        "></div>
        <div style="
          width: 40px;
          height: 40px;
          background-color: rgba(59,130,246,0.2);
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

    L.marker([this.userLocation.lat, this.userLocation.lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup('<strong>Your Location</strong>')
  }

  private addIssueMarkers(issues: StaffMapIssueResponse[]): void {
    this.issueMarkers.forEach(m => m.remove())
    this.issueMarkers = []

    issues.forEach((issue) => {
      if (!issue.latitude || !issue.longitude) return

      const color = this.getTypeColorFromCode(issue.issueType.id, issue.issueType.code)
      const isBreached = issue.isSlaBreached
      const size = isBreached ? 24 : 18

      const icon = L.divIcon({
        html: `<div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ${isBreached ? 'animation: pulse 1.5s infinite;' : ''}
        "></div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })

      const marker = L.marker([issue.latitude, issue.longitude], { icon })
        .addTo(this.map)
        .bindPopup(`<strong>${issue.publicCode}</strong><br/>${issue.title}<br/><small>${issue.status.name}</small>`)

      marker.on('click', () => {
        this.selectedIssue.set(issue)
      })

      this.issueMarkers.push(marker)
    })
  }

  getTypeColor(typeId: number): string {
    const type = this.issueTypes().find(t => t.issueTypeId === typeId)
    if (type && DEFAULT_ISSUE_TYPE_COLORS[type.typeCode.toUpperCase()]) {
      return DEFAULT_ISSUE_TYPE_COLORS[type.typeCode.toUpperCase()]
    }
    return DEFAULT_ISSUE_TYPE_COLORS['DEFAULT']
  }

  private getTypeColorFromCode(typeId: number, typeCode?: string): string {
    if (typeCode && DEFAULT_ISSUE_TYPE_COLORS[typeCode.toUpperCase()]) {
      return DEFAULT_ISSUE_TYPE_COLORS[typeCode.toUpperCase()]
    }
    return this.getTypeColor(typeId)
  }

  getStatusBadgeClass(statusCode: string): string {
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

  getPriorityBadgeClass(priorityCode: string): string {
    const code = priorityCode?.toUpperCase() || ''
    if (code === 'CRITICAL') return 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
    if (code === 'HIGH') return 'bg-orange-100 text-orange-800'
    if (code === 'MEDIUM') return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  closeIssueModal(): void {
    this.selectedIssue.set(null)
  }

  closeModal(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.closeIssueModal()
    }
  }

  viewIncidentDetails(): void {
    const issue = this.selectedIssue()
    if (issue) {
      void this.router.navigate(['/staff/incidents', issue.issueId])
    }
  }
}
