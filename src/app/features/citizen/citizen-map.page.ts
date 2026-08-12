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
import { DashboardService } from '../../core/services/dashboard.service'
import type { NearbyIssueResponse, IssueTypeLookup, IssueStatusLookup, IssuePriorityLookup } from '../../core/services/dashboard.service'

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Default colors for issue types
const DEFAULT_ISSUE_TYPE_COLORS: Record<string, string> = {
  'LIGHT': '#fbbf24',      // Amber - street light
  'POTHOLE': '#ef4444',    // Red - pothole
  'FLOOD': '#3b82f6',      // Blue - flood
  'TRASH': '#22c55e',      // Green - trash
  'SIGN': '#a855f7',       // Purple - traffic sign
  'DEFAULT': '#6b7280',     // Gray - default
}

// Color palette for user to choose from
const COLOR_PALETTE = [
  '#ef4444', '#f97316', '#fbbf24', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f43f5e', '#78716c', '#6b7280', '#1e293b',
]

@Component({
  selector: 'app-citizen-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative h-screen w-full overflow-hidden">
      <!-- Search Bar (Top Left) -->
      <div class="absolute left-4 top-4 z-20 w-[400px]">
        <div
          class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/80 p-2 shadow-sm backdrop-blur-xl"
        >
          <span class="material-symbols-outlined ml-2 text-[var(--color-outline)]">search</span>
          <input
            type="text"
            class="flex-1 border-none bg-transparent py-1 text-[14px] text-[var(--color-on-surface)] placeholder:text-[var(--color-outline-variant)] focus:outline-none focus:ring-0"
            placeholder="Search locations, incident IDs..."
            [(ngModel)]="searchQuery"
          />
          <button class="rounded-md p-1 text-[var(--color-outline)] hover:bg-[var(--color-surface-container)]">
            <span class="material-symbols-outlined text-[20px]">mic</span>
          </button>
        </div>
      </div>

      <!-- Filter Sidebar (Top Right) -->
      <div
        class="absolute right-4 top-4 z-20 flex w-[320px] max-h-[calc(100vh-32px)] flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 shadow-lg backdrop-blur-xl"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between border-b border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4"
        >
          <h2 class="text-[18px] font-semibold text-[var(--color-on-surface)]">Filters</h2>
          <button
            (click)="clearAllFilters()"
            class="text-[12px] font-medium text-[var(--color-primary)] hover:underline"
          >
            Clear All
          </button>
        </div>

        <!-- Filter Content -->
        <div class="filter-scroll flex flex-1 flex-col gap-6 overflow-y-auto p-4">

          <!-- Issue Type Section -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <h3 class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                Issue Type
              </h3>
              <button
                (click)="toggleColorPicker()"
                class="flex items-center gap-1 text-[11px] text-[var(--color-primary)] hover:underline"
              >
                <span class="material-symbols-outlined text-[14px]">palette</span>
                Colors
              </button>
            </div>

            @if (showColorPicker && selectedColorType()) {
              <!-- Color Picker Popup -->
              <div class="rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] p-3">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-[11px] text-[var(--color-on-surface-variant)]">
                    Pick color for: {{ selectedColorType()?.typeName }}
                  </span>
                  <button (click)="toggleColorPicker()" class="text-[var(--color-outline)]">
                    <span class="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
                <div class="grid grid-cols-8 gap-1">
                  @for (color of colorPalette; track color) {
                    <button
                      (click)="setIssueTypeColor(selectedColorType()!.issueTypeId, color)"
                      class="h-6 w-6 rounded border-2 transition-transform hover:scale-110"
                      [style.background-color]="color"
                      [style.border-color]="getIssueTypeColor(selectedColorType()!.issueTypeId) === color ? 'var(--color-on-surface)' : 'transparent'"
                    ></button>
                  }
                </div>
              </div>
            }

            @if (isLoadingFilters()) {
              @for (i of [1, 2, 3]; track i) {
                <div class="h-8 w-full animate-pulse rounded bg-[var(--color-surface-dim)]"></div>
              }
            } @else {
              @for (type of issueTypes(); track type.issueTypeId) {
                <label class="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    [checked]="isTypeSelected(type.issueTypeId)"
                    (change)="toggleType(type.issueTypeId)"
                    class="h-4 w-4 rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span
                    class="h-3 w-3 rounded-full"
                    [style.background-color]="getIssueTypeColor(type.issueTypeId)"
                  ></span>
                  <span class="flex-1 text-[14px] text-[var(--color-on-surface)]">{{ type.typeName }}</span>
                </label>
              }
            }
          </div>

          <!-- Status Section -->
          <div class="flex flex-col gap-2">
            <h3 class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Status
            </h3>
            @if (isLoadingFilters()) {
              <div class="h-8 w-full animate-pulse rounded bg-[var(--color-surface-dim)]"></div>
            } @else {
              <div class="flex flex-wrap gap-2">
                @for (status of issueStatuses(); track status.statusId) {
                  <button
                    (click)="toggleStatus(status.statusCode)"
                    [style.background-color]="isStatusSelected(status.statusCode) ? 'var(--color-error-container)' : 'var(--color-surface-container)'"
                    [style.color]="isStatusSelected(status.statusCode) ? 'var(--color-error)' : 'var(--color-on-surface)'"
                    [style.border-color]="isStatusSelected(status.statusCode) ? 'var(--color-error)' : 'var(--color-outline-variant)'"
                    class="flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors"
                  >
                    {{ status.statusName }}
                  </button>
                }
              </div>
            }
          </div>

          <!-- Priority Section -->
          <div class="flex flex-col gap-2">
            <h3 class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Priority
            </h3>
            @if (isLoadingFilters()) {
              <div class="h-8 w-full animate-pulse rounded bg-[var(--color-surface-dim)]"></div>
            } @else {
              <div class="flex flex-wrap gap-2">
                @for (priority of issuePriorities(); track priority.priorityId) {
                  <button
                    (click)="togglePriority(priority.priorityCode)"
                    [style.background-color]="isPrioritySelected(priority.priorityCode) ? 'var(--color-primary-container)' : 'var(--color-surface-container)'"
                    [style.color]="isPrioritySelected(priority.priorityCode) ? 'var(--color-on-primary-container)' : 'var(--color-on-surface)'"
                    [style.border-color]="isPrioritySelected(priority.priorityCode) ? 'var(--color-primary)' : 'var(--color-outline-variant)'"
                    class="flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors"
                  >
                    {{ priority.priorityName }}
                  </button>
                }
              </div>
            }
          </div>

          <!-- Date Range Section -->
          <div class="flex flex-col gap-2">
            <h3 class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Date Range
            </h3>
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <label class="text-[12px] text-[var(--color-on-surface-variant)]">From:</label>
                <input
                  type="datetime-local"
                  [(ngModel)]="filters.fromDate"
                  (ngModelChange)="applyFilters()"
                  class="flex-1 rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] px-2 py-1 text-[12px] text-[var(--color-on-surface)]"
                />
              </div>
              <div class="flex items-center gap-2">
                <label class="text-[12px] text-[var(--color-on-surface-variant)]">To:</label>
                <input
                  type="datetime-local"
                  [(ngModel)]="filters.toDate"
                  (ngModelChange)="applyFilters()"
                  class="flex-1 rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] px-2 py-1 text-[12px] text-[var(--color-on-surface)]"
                />
              </div>
              <div class="flex flex-wrap gap-1">
                <button
                  (click)="setQuickDateRange(1)"
                  [style.background-color]="quickDateDays === 1 ? 'var(--color-primary-container)' : ''"
                  [style.color]="quickDateDays === 1 ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)'"
                  class="rounded px-2 py-0.5 text-[11px] transition-colors"
                >
                  24h
                </button>
                <button
                  (click)="setQuickDateRange(7)"
                  [style.background-color]="quickDateDays === 7 ? 'var(--color-primary-container)' : ''"
                  [style.color]="quickDateDays === 7 ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)'"
                  class="rounded px-2 py-0.5 text-[11px] transition-colors"
                >
                  7d
                </button>
                <button
                  (click)="setQuickDateRange(30)"
                  [style.background-color]="quickDateDays === 30 ? 'var(--color-primary-container)' : ''"
                  [style.color]="quickDateDays === 30 ? 'var(--color-on-primary-container)' : 'var(--color-on-surface-variant)'"
                  class="rounded px-2 py-0.5 text-[11px] transition-colors"
                >
                  30d
                </button>
                <button
                  (click)="clearDateRange()"
                  class="rounded px-2 py-0.5 text-[11px] text-[var(--color-primary)] transition-colors hover:bg-[var(--color-surface-container)]"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4">
          <button
            (click)="applyFilters()"
            class="w-full rounded-lg bg-[var(--color-primary)] py-2 text-[12px] font-medium text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary)]/90"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <!-- Legend (Bottom Left) -->
      <div class="absolute bottom-4 left-4 z-10">
        <div
          class="flex flex-col gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 p-4 shadow-sm backdrop-blur-md"
        >
          <h4 class="text-[12px] font-bold text-[var(--color-on-surface)]">Legend</h4>
          <div class="flex items-center gap-3">
            <div class="h-3 w-3 rounded-full bg-[#ef4444]"></div>
            <span class="text-[11px] text-[var(--color-on-surface-variant)]">Your Location</span>
          </div>
          @for (type of issueTypes(); track type.issueTypeId) {
            <div class="flex items-center gap-3">
              <div
                class="h-3 w-3 rounded-full"
                [style.background-color]="getIssueTypeColor(type.issueTypeId)"
              ></div>
              <span class="text-[11px] text-[var(--color-on-surface-variant)]">{{ type.typeName }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Map Controls (Bottom Right) -->
      <div class="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 text-[var(--color-on-surface)] shadow-sm backdrop-blur-md transition-colors hover:bg-[var(--color-surface-container)]"
          title="My Location"
          (click)="centerOnUserLocation()"
        >
          <span class="material-symbols-outlined text-[20px]">my_location</span>
        </button>
        <div
          class="overflow-hidden rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 shadow-sm backdrop-blur-md"
        >
          <button
            class="flex h-10 w-10 items-center justify-center border-b border-[var(--color-outline-variant)] text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]"
            title="Zoom In"
            (click)="zoomIn()"
          >
            <span class="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button
            class="flex h-10 w-10 items-center justify-center text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]"
            title="Zoom Out"
            (click)="zoomOut()"
          >
            <span class="material-symbols-outlined text-[20px]">remove</span>
          </button>
        </div>
      </div>

      <!-- Map Container -->
      <div #mapContainer class="h-full w-full z-0"></div>

      <!-- Loading overlay -->
      @if (isLoading()) {
        <div
          class="absolute inset-0 z-30 flex items-center justify-center bg-[var(--color-surface-container-lowest)]/80 backdrop-blur-sm"
        >
          <div class="flex flex-col items-center gap-2">
            <span class="material-symbols-outlined animate-spin text-4xl text-[var(--color-primary)]">
              progress_activity
            </span>
            <p class="text-sm text-[var(--color-on-surface-variant)]">{{ loadingMessage() }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      :host ::ng-deep .leaflet-container {
        height: 100%;
        width: 100%;
        background: var(--color-surface-dim, #e5e5e5);
      }

      :host ::ng-deep .leaflet-control-attribution {
        font-size: 9px;
      }

      .filter-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .filter-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .filter-scroll::-webkit-scrollbar-thumb {
        background-color: #c3c6d7;
        border-radius: 10px;
      }

      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
    `,
  ],
})
export class CitizenMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>

  private readonly dashboardService = inject(DashboardService)
  private readonly router = inject(Router)

  // Color palette
  readonly colorPalette = COLOR_PALETTE
  readonly defaultColors = DEFAULT_ISSUE_TYPE_COLORS

  // Map instance
  private map!: L.Map
  private issueMarkers: L.Marker[] = []
  private currentLocationMarker: L.Marker | null = null
  private userLocation = { lat: 10.7769, lng: 106.7009 }

  // Loading states
  isLoading = signal(true)
  isLoadingFilters = signal(true)
  loadingMessage = signal('Getting your location...')

  // Filter data from API
  issueTypes = signal<IssueTypeLookup[]>([])
  issueStatuses = signal<IssueStatusLookup[]>([])
  issuePriorities = signal<IssuePriorityLookup[]>([])

  // Custom colors for issue types
  private customColors: Record<number, string> = {}

  // Color picker state
  showColorPicker = false
  selectedColorType = signal<IssueTypeLookup | null>(null)

  // Selected filters
  selectedTypeIds = new Set<number>()
  selectedStatusCodes = new Set<string>()
  selectedPriorityCodes = new Set<string>()

  // Quick date filter
  quickDateDays: number | null = null

  // Search
  searchQuery = ''

  // Date filters
  filters = {
    fromDate: '',
    toDate: '',
  }

  ngOnInit(): void {
    this.loadFilterData()
    this.loadCustomColors()
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

    // Load all filter data in parallel
    this.dashboardService.getIssueTypes().subscribe({
      next: (types) => {
        console.log('Issue types loaded:', types)
        this.issueTypes.set(types)
        // Select all types by default
        types.forEach(t => this.selectedTypeIds.add(t.issueTypeId))
      },
      error: (err) => console.error('Error loading issue types:', err)
    })

    this.dashboardService.getIssueStatuses().subscribe({
      next: (statuses) => {
        console.log('Issue statuses loaded:', statuses)
        this.issueStatuses.set(statuses)
      },
      error: (err) => console.error('Error loading issue statuses:', err)
    })

    this.dashboardService.getIssuePriorities().subscribe({
      next: (priorities) => {
        console.log('Issue priorities loaded:', priorities)
        this.issuePriorities.set(priorities)
        this.isLoadingFilters.set(false)
      },
      error: (err) => {
        console.error('Error loading issue priorities:', err)
        this.isLoadingFilters.set(false)
      },
    })
  }

  private loadCustomColors(): void {
    const stored = this.dashboardService.getIssueTypeColors()
    this.customColors = stored
  }

  getIssueTypeColor(typeId: number): string {
    if (this.customColors[typeId]) {
      return this.customColors[typeId]
    }
    const type = this.issueTypes().find(t => t.issueTypeId === typeId)
    if (type && this.defaultColors[type.typeCode.toUpperCase()]) {
      return this.defaultColors[type.typeCode.toUpperCase()]
    }
    return this.defaultColors['DEFAULT']
  }

  setIssueTypeColor(typeId: number, color: string): void {
    this.customColors[typeId] = color
    this.dashboardService.setIssueTypeColor(typeId, color)
    this.updateMapMarkers()
  }

  toggleColorPicker(): void {
    this.showColorPicker = !this.showColorPicker
    if (!this.showColorPicker) {
      this.selectedColorType.set(null)
    }
  }

  isTypeSelected(typeId: number): boolean {
    return this.selectedTypeIds.has(typeId)
  }

  toggleType(typeId: number): void {
    if (this.selectedTypeIds.has(typeId)) {
      this.selectedTypeIds.delete(typeId)
    } else {
      this.selectedTypeIds.add(typeId)
    }
  }

  isStatusSelected(statusCode: string): boolean {
    return this.selectedStatusCodes.has(statusCode.toUpperCase())
  }

  toggleStatus(statusCode: string): void {
    const code = statusCode.toUpperCase()
    if (this.selectedStatusCodes.has(code)) {
      this.selectedStatusCodes.delete(code)
    } else {
      this.selectedStatusCodes.add(code)
    }
  }

  isPrioritySelected(priorityCode: string): boolean {
    return this.selectedPriorityCodes.has(priorityCode.toUpperCase())
  }

  togglePriority(priorityCode: string): void {
    const code = priorityCode.toUpperCase()
    if (this.selectedPriorityCodes.has(code)) {
      this.selectedPriorityCodes.delete(code)
    } else {
      this.selectedPriorityCodes.add(code)
    }
  }

  setQuickDateRange(days: number): void {
    this.quickDateDays = days
    const now = new Date()
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    this.filters.toDate = now.toISOString().slice(0, 16)
    this.filters.fromDate = from.toISOString().slice(0, 16)
    this.applyFilters()
  }

  clearDateRange(): void {
    this.quickDateDays = null
    this.filters.fromDate = ''
    this.filters.toDate = ''
    this.applyFilters()
  }

  clearAllFilters(): void {
    // Reset type selections
    this.selectedTypeIds.clear()
    this.issueTypes().forEach(t => this.selectedTypeIds.add(t.issueTypeId))
    
    // Reset status selections
    this.selectedStatusCodes.clear()
    
    // Reset priority selections
    this.selectedPriorityCodes.clear()
    
    // Reset date range
    this.clearDateRange()
    
    // Apply filters
    this.applyFilters()
  }

  applyFilters(): void {
    this.loadIssues()
  }

  private initMap(): void {
    const container = this.mapContainer.nativeElement
    if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
      setTimeout(() => this.initMap(), 100)
      return
    }

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
      this.isLoading.set(false)
      return
    }

    this.isLoading.set(true)
    this.loadingMessage.set('Getting your location...')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        this.userLocation = { lat: latitude, lng: longitude }
        this.map.setView([latitude, longitude], 15)
        this.loadIssues()
        this.isLoading.set(false)
      },
      () => {
        this.isLoading.set(false)
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
    if (this.map) {
      this.map.zoomIn()
    }
  }

  zoomOut(): void {
    if (this.map) {
      this.map.zoomOut()
    }
  }

  private loadIssues(): void {
    this.isLoading.set(true)
    this.loadingMessage.set('Loading nearby incidents...')

    const options: any = {
      limit: 50,
      withinDays: 365,
    }

    // Add type filter if not all selected
    if (this.selectedTypeIds.size > 0 && this.selectedTypeIds.size < this.issueTypes().length) {
      if (this.selectedTypeIds.size === 1) {
        options.issueTypeId = Array.from(this.selectedTypeIds)[0]
      }
    }

    // Add status filter
    if (this.selectedStatusCodes.size > 0) {
      options.statusCodes = Array.from(this.selectedStatusCodes)
    }

    // Add priority filter
    if (this.selectedPriorityCodes.size > 0) {
      options.priorityCodes = Array.from(this.selectedPriorityCodes)
    }

    // Add date range
    if (this.filters.fromDate) {
      options.fromDate = new Date(this.filters.fromDate).toISOString()
    }
    if (this.filters.toDate) {
      options.toDate = new Date(this.filters.toDate).toISOString()
    }

    this.dashboardService.getNearbyIssues(
      this.userLocation.lat,
      this.userLocation.lng,
      5000,
      options
    ).subscribe({
      next: (issues) => {
        // Client-side filter for multi-type selection
        let filteredIssues = issues
        if (this.selectedTypeIds.size > 0 && this.selectedTypeIds.size < this.issueTypes().length) {
          if (this.selectedTypeIds.size > 1) {
            filteredIssues = filteredIssues.filter(i => this.selectedTypeIds.has(i.issueType.id))
          }
        }
        
        this.addIssueMarkers(filteredIssues)
        this.addUserLocationMarker()
        this.isLoading.set(false)
      },
      error: () => {
        console.error('Failed to load issues')
        this.isLoading.set(false)
      },
    })
  }

  private addUserLocationMarker(): void {
    if (this.currentLocationMarker) {
      this.currentLocationMarker.remove()
      this.currentLocationMarker = null
    }

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

    this.currentLocationMarker = L.marker([this.userLocation.lat, this.userLocation.lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup('<strong>Your Location</strong>')
  }

  private addIssueMarkers(issues: NearbyIssueResponse[]): void {
    // Clear existing markers
    this.issueMarkers.forEach(m => m.remove())
    this.issueMarkers = []

    issues.forEach((issue) => {
      const markerColor = this.getIssueTypeColor(issue.issueType.id)
      
      const icon = L.divIcon({
        html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([issue.latitude, issue.longitude], { icon })
        .addTo(this.map)
        .bindPopup(`
          <div style="min-width: 180px;">
            <strong>${issue.title}</strong><br/>
            <span style="color: #666; font-size: 12px;">${issue.issueType.name}</span><br/>
            <span style="font-size: 11px; color: ${markerColor};">${issue.status.name}</span>
          </div>
        `)

      marker.on('click', () => {
        // Show color picker on marker click
        const type = this.issueTypes().find(t => t.issueTypeId === issue.issueType.id)
        if (type) {
          this.selectedColorType.set(type)
          this.showColorPicker = true
        }
        void this.router.navigate(['/citizen/reports', issue.id])
      })

      this.issueMarkers.push(marker)
    })
  }

  private updateMapMarkers(): void {
    this.loadIssues()
  }
}
