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
import { DepartmentManagerService } from '../../core/services/department-manager.service'
import {
  DepartmentManagerIssueSummary,
  DepartmentManagerIssueDetail,
  DepartmentManagerIssueListRequest,
} from '../../core/services/department-manager.service'
import { DashboardService } from '../../core/services/dashboard.service'
import { IssueTypeLookup, IssueStatusLookup } from '../../core/services/dashboard.service'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STATUS_COLORS: Record<string, string> = {
  'BREACHED': '#F44336',
  'RESPONSE_BREACHED': '#FF5722',
  'AT_RISK': '#FF9800',
  'ON_TRACK': '#4CAF50',
  'RESOLVED': '#2196F3',
  'NO_SLA': '#9E9E9E',
}

// Default colors for issue types
const DEFAULT_ISSUE_TYPE_COLORS: Record<string, string> = {
  'LIGHT': '#fbbf24',
  'POTHOLE': '#ef4444',
  'FLOOD': '#3b82f6',
  'TRASH': '#22c55e',
  'SIGN': '#a855f7',
  'DEFAULT': '#6b7280',
}

@Component({
  selector: 'app-staff-manager-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative h-screen w-full overflow-hidden">
      <!-- Search Bar (Top Left) -->
      <div class="absolute left-4 top-4 z-[100] w-[400px]">
        <div class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/80 p-2 shadow-sm backdrop-blur-xl">
          <span class="material-symbols-outlined ml-2 text-[var(--color-outline)]">search</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            class="flex-1 border-none bg-transparent py-1 text-[14px] text-[var(--color-on-surface)] placeholder:text-[var(--color-outline-variant)] focus:outline-none focus:ring-0"
            placeholder="Search incidents..."
          />
        </div>
      </div>

      <!-- Filter Sidebar (Top Right) -->
      <div class="absolute right-4 top-4 z-[100] flex w-[320px] max-h-[calc(100vh-32px)] flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)]/90 shadow-lg backdrop-blur-xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4">
          <h2 class="text-[18px] font-semibold text-[var(--color-on-surface)]">Filters</h2>
          <button (click)="clearAllFilters()" class="text-[12px] font-medium text-[var(--color-primary)] hover:underline">
            Clear All
          </button>
        </div>

        <!-- Filter Content -->
        <div class="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <!-- Assignment Filter -->
          <div class="filter-section">
            <h3 class="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Assignment</h3>
            <div class="flex flex-wrap gap-2">
              @for (option of assignmentOptions; track option.value) {
                <button
                  (click)="selectAssignmentFilter(option.value)"
                  class="rounded-full px-3 py-1 text-[12px] font-medium transition-colors"
                  [class]="selectedAssignment === option.value
                    ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
                    : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]'"
                >
                  {{ option.label }}
                </button>
              }
            </div>
          </div>

          <!-- Issue Type Filter (Checkbox Style - Multiple Selection) -->
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
                      [checked]="selectedIssueTypeIds.includes(type.issueTypeId)"
                      (change)="toggleIssueType(type.issueTypeId)"
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

          <!-- Issue Status Filter (Checkbox Style - Multiple Selection) -->
          <div class="filter-section">
            <h3 class="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Issue Status</h3>
            @if (isLoadingFilters()) {
              @for (i of [1, 2]; track i) {
                <div class="h-8 w-full animate-pulse rounded bg-[var(--color-surface-dim)] mb-1"></div>
              }
            } @else {
              <div class="flex flex-col gap-2">
                @for (status of issueStatuses(); track status.statusId) {
                  <label class="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      [checked]="selectedStatusIds.includes(status.statusId)"
                      (change)="toggleStatus(status.statusId)"
                      class="h-4 w-4 rounded border-[var(--color-outline)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <span class="text-[14px] text-[var(--color-on-surface)]">
                      {{ status.statusName }}
                    </span>
                  </label>
                }
              </div>
            }
          </div>

          <!-- Priority Filter (Checkbox Style - Multiple Selection) -->
          <div class="filter-section">
            <h3 class="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)]">Priority</h3>
            <div class="flex flex-col gap-2">
              @for (priority of priorities; track priority.id) {
                <label class="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    [checked]="selectedPriorityIds.includes(priority.id)"
                    (change)="togglePriority(priority.id)"
                    class="h-4 w-4 rounded border-[var(--color-outline)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span class="flex items-center gap-2 text-[14px] text-[var(--color-on-surface)]">
                    <span class="h-2 w-2 rounded-full" [style.background-color]="priority.color"></span>
                    {{ priority.name }}
                  </span>
                </label>
              }
            </div>
          </div>
        </div>

        <!-- Apply Filter Button -->
        <div class="border-t border-[var(--color-outline-variant)] bg-[var(--color-surface)]/50 p-4">
          <button
            (click)="applyFilters()"
            [disabled]="isLoading()"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[14px] font-medium text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
          >
            @if (isLoading()) {
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-on-primary)] border-t-transparent"></div>
            }
            Apply Filters
          </button>
          <p class="mt-2 text-center text-[12px] text-[var(--color-on-surface-variant)]">
            Showing {{ filteredIssues().length }} of {{ issues().length }} incidents
          </p>
        </div>
      </div>

      <!-- Map -->
      <div #mapContainer class="h-full w-full z-0"></div>

      <!-- Issue Cards (Bottom) -->
      <div class="absolute bottom-4 left-4 right-[340px] z-[100]">
        <div class="flex gap-3 overflow-x-auto pb-2">
          @for (issue of filteredIssues().slice(0, 10); track issue.issueId) {
            <div
              (click)="focusOnIssue(issue)"
              class="min-w-[250px] shrink-0 cursor-pointer rounded-lg border bg-[var(--color-surface)]/90 p-3 shadow-lg backdrop-blur-xl transition-all hover:scale-105"
            >
              <div class="mb-2 flex items-center justify-between">
                <span class="text-[12px] font-bold text-[var(--color-on-surface)]">{{ issue.publicCode }}</span>
                <span class="rounded-full px-2 py-0.5 text-[10px] font-medium text-white" [style.background-color]="getStatusColor(issue.slaStatus)">
                  {{ formatStatus(issue.slaStatus) }}
                </span>
              </div>
              <p class="mb-1 text-[14px] font-medium text-[var(--color-on-surface)]">{{ issue.title }}</p>
              <div class="flex items-center justify-between text-[11px] text-[var(--color-on-surface-variant)]">
                <span>{{ issue.issueTypeName }}</span>
                <span [style.color]="issue.priorityColor">{{ issue.priorityName }}</span>
              </div>
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
              @if (getImageUrl(selectedIssue()!.thumbnailUrl)) {
                <img
                  [src]="getImageUrl(selectedIssue()!.thumbnailUrl)"
                  [alt]="selectedIssue()!.title"
                  class="h-full w-full object-cover"
                />
              } @else {
                <div class="flex h-full items-center justify-center text-[var(--color-outline)]">
                  <span class="material-symbols-outlined text-6xl">report</span>
                </div>
              }
              <button
                (click)="closeIssueModal()"
                class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
              >
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
              <span
                class="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold"
                [style.background-color]="getStatusColor(selectedIssue()!.slaStatus)"
                style="color: white;"
              >
                {{ formatStatus(selectedIssue()!.slaStatus) }}
              </span>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto">
              <div class="mb-4">
                <p class="mb-1 text-xs text-[var(--color-primary)]">
                  {{ selectedIssue()!.publicCode }}
                </p>
                <h2 class="text-xl font-semibold text-[var(--color-on-surface)]">
                  {{ selectedIssue()!.title }}
                </h2>
              </div>

              <div class="mb-4 flex flex-wrap gap-2">
                <span class="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-container)] px-3 py-1 text-xs text-[var(--color-on-surface-variant)]">
                  <span class="material-symbols-outlined text-[14px]">category</span>
                  {{ selectedIssue()!.issueTypeName }}
                </span>
                <span class="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-container)] px-3 py-1 text-xs" [style.color]="selectedIssue()!.priorityColor">
                  <span class="material-symbols-outlined text-[14px]">priority_high</span>
                  {{ selectedIssue()!.priorityName }}
                </span>
              </div>

              <div class="flex items-center gap-4 text-sm text-[var(--color-on-surface-variant)]">
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">schedule</span>
                  {{ formatDate(selectedIssue()!.reportedAt) }}
                </span>
              </div>

              <!-- Assigned Members Section -->
              @if (selectedIssueDetail()?.assignedMembers?.length) {
                <div class="mt-4 border-t border-[var(--color-outline-variant)] pt-4">
                  <h3 class="mb-3 text-[14px] font-semibold text-[var(--color-on-surface)]">Assigned Staff</h3>
                  <div class="flex flex-wrap gap-2">
                    @for (member of selectedIssueDetail()!.assignedMembers; track member.memberId) {
                      <div class="inline-flex items-center gap-2 rounded-full bg-[var(--color-surface-container)] px-3 py-1.5 text-xs">
                        @if (member.avatarUrl) {
                          <img [src]="member.avatarUrl" [alt]="member.fullName" class="h-5 w-5 rounded-full object-cover" />
                        } @else {
                          <span class="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-medium text-[var(--color-on-primary)]">
                            {{ member.fullName.charAt(0).toUpperCase() }}
                          </span>
                        }
                        <span class="text-[var(--color-on-surface)]">{{ member.fullName }}</span>
                        <span class="rounded-full px-1.5 py-0.5 text-[10px] font-medium" [class]="getMemberStatusClass(member.status)">
                          {{ formatMemberStatus(member.status) }}
                        </span>
                      </div>
                    }
                  </div>
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
    </div>
  `,
  styles: [`
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `],
})
export class DepartmentManagerMapComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef

  private readonly dmService = inject(DepartmentManagerService)
  private readonly dashboardService = inject(DashboardService)
  private readonly router = inject(Router)

  private map!: L.Map
  private markers: Map<number, L.Marker> = new Map()

  issues = signal<DepartmentManagerIssueSummary[]>([])
  filteredIssues = signal<DepartmentManagerIssueSummary[]>([])
  selectedIssue = signal<DepartmentManagerIssueSummary | null>(null)
  selectedIssueDetail = signal<DepartmentManagerIssueDetail | null>(null)
  isLoading = signal(false)
  isLoadingDetail = signal(false)

  // Filter lookups
  issueTypes = signal<IssueTypeLookup[]>([])
  issueStatuses = signal<IssueStatusLookup[]>([])
  isLoadingFilters = signal(true)

  // Custom colors for issue types
  private customTypeColors: Record<number, string> = {}

  // Selected filters (multiple selection with arrays)
  searchQuery = ''
  selectedAssignment = ''
  selectedIssueTypeIds: number[] = []
  selectedStatusIds: number[] = []
  selectedPriorityIds: number[] = []

  assignmentOptions = [
    { label: 'My Issues', value: 'my_assigned' },
    { label: 'Team Assigned', value: 'team_assigned' },
    { label: 'Unassigned', value: 'unassigned' },
    { label: 'All', value: '' },
  ]

  priorities = [
    { id: 1, name: 'Critical', color: '#F44336' },
    { id: 2, name: 'High', color: '#FF9800' },
    { id: 3, name: 'Medium', color: '#FFC107' },
    { id: 4, name: 'Low', color: '#4CAF50' },
  ]

  ngOnInit(): void {
    this.loadFilterData()
    this.loadIssues()
  }

  ngAfterViewInit(): void {
    this.initMap()
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove()
    }
  }

  private loadFilterData(): void {
    this.isLoadingFilters.set(true)

    // Load issue types
    this.dashboardService.getIssueTypes().subscribe({
      next: (types) => {
        this.issueTypes.set(types)
      },
      error: (err) => console.error('Error loading issue types:', err)
    })

    // Load issue statuses
    this.dashboardService.getIssueStatuses().subscribe({
      next: (statuses) => {
        this.issueStatuses.set(statuses)
      },
      error: (err) => console.error('Error loading issue statuses:', err)
    })

    // Load priorities (already loaded in the component)
    this.dashboardService.getIssuePriorities().subscribe({
      next: (priorities) => {
        this.isLoadingFilters.set(false)
      },
      error: (err) => {
        console.error('Error loading priorities:', err)
        this.isLoadingFilters.set(false)
      }
    })
  }

  // Toggle methods for multiple selection
  toggleIssueType(typeId: number): void {
    const index = this.selectedIssueTypeIds.indexOf(typeId)
    if (index >= 0) {
      this.selectedIssueTypeIds.splice(index, 1)
    } else {
      this.selectedIssueTypeIds.push(typeId)
    }
  }

  toggleStatus(statusId: number): void {
    const index = this.selectedStatusIds.indexOf(statusId)
    if (index >= 0) {
      this.selectedStatusIds.splice(index, 1)
    } else {
      this.selectedStatusIds.push(statusId)
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

  getTypeColor(typeId: number): string {
    if (this.customTypeColors[typeId]) {
      return this.customTypeColors[typeId]
    }
    const type = this.issueTypes().find(t => t.issueTypeId === typeId)
    if (type && DEFAULT_ISSUE_TYPE_COLORS[type.typeCode.toUpperCase()]) {
      return DEFAULT_ISSUE_TYPE_COLORS[type.typeCode.toUpperCase()]
    }
    return DEFAULT_ISSUE_TYPE_COLORS['DEFAULT']
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map)

    // Default to Vietnam
    this.map.setView([10.8231, 106.6297], 12)
  }

  private updateMapMarkers(issues: DepartmentManagerIssueSummary[]): void {
    this.markers.forEach(marker => marker.remove())
    this.markers.clear()

    const validCoords: [number, number][] = []

    issues.forEach(issue => {
      const lat = Number(issue.latitude) || 10.8231
      const lng = Number(issue.longitude) || 106.6297

      if (lat && lng) {
        validCoords.push([lat, lng])
      }

      const color = this.getTypeColorFromCode(issue.issueTypeId, issue.issueTypeCode)
      const icon = L.divIcon({
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: 'custom-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([lat, lng], { icon })
        .on('click', () => {
          this.selectedIssue.set(issue)
        })
        .addTo(this.map)

      this.markers.set(issue.issueId, marker)
    })

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords)
      this.map.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  private getTypeColorFromCode(typeId: number, typeCode?: string): string {
    if (typeCode && DEFAULT_ISSUE_TYPE_COLORS[typeCode.toUpperCase()]) {
      return DEFAULT_ISSUE_TYPE_COLORS[typeCode.toUpperCase()]
    }
    return this.getTypeColor(typeId)
  }

  applyFilters(): void {
    // All filters are applied on the backend, just reload
    this.loadIssues()
  }

  onSearchChange(): void {
    // Search is applied client-side for now
    let result = this.issues()
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase()
      result = result.filter(i =>
        i.publicCode.toLowerCase().includes(query) ||
        i.title.toLowerCase().includes(query)
      )
    }
    this.filteredIssues.set(result)
    this.updateMapMarkers(result)
  }

  selectAssignmentFilter(value: string): void {
    this.selectedAssignment = value
    this.applyFilters()
  }

  loadIssues(): void {
    this.isLoading.set(true)

    const request: DepartmentManagerIssueListRequest = {
      pageSize: 100,
      filter: this.selectedAssignment as any || undefined,
      statusIds: this.selectedStatusIds.length > 0 ? this.selectedStatusIds : undefined,
      priorityIds: this.selectedPriorityIds.length > 0 ? this.selectedPriorityIds : undefined,
      issueTypeIds: this.selectedIssueTypeIds.length > 0 ? this.selectedIssueTypeIds : undefined,
      keyword: this.searchQuery || undefined,
    }

    this.dmService.getIssues(request).subscribe({
      next: (data) => {
        this.issues.set(data.items)
        this.filteredIssues.set(data.items)
        this.updateMapMarkers(data.items)
        this.isLoading.set(false)
      },
      error: (err) => {
        console.error('Failed to load issues:', err)
        this.isLoading.set(false)
      },
    })
  }

  clearAllFilters(): void {
    this.searchQuery = ''
    this.selectedAssignment = ''
    this.selectedIssueTypeIds = []
    this.selectedStatusIds = []
    this.selectedPriorityIds = []
    this.loadIssues()
  }

  focusOnIssue(issue: DepartmentManagerIssueSummary): void {
    const marker = this.markers.get(issue.issueId)
    if (marker) {
      this.selectedIssue.set(issue)
      this.loadIssueDetail(issue.issueId)
      // Pan map to the issue location
      const lat = Number(issue.latitude) || 10.8231
      const lng = Number(issue.longitude) || 106.6297
      this.map.setView([lat, lng], 16, { animate: true })
    }
  }

  private loadIssueDetail(issueId: number): void {
    this.isLoadingDetail.set(true)
    this.selectedIssueDetail.set(null)
    this.dmService.getIssueDetail(issueId).subscribe({
      next: (detail) => {
        this.selectedIssueDetail.set(detail)
        this.isLoadingDetail.set(false)
      },
      error: (err) => {
        console.error('Failed to load issue detail:', err)
        this.isLoadingDetail.set(false)
      }
    })
  }

  getMemberStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  formatMemberStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  closeIssueModal(): void {
    this.selectedIssue.set(null)
    this.selectedIssueDetail.set(null)
  }

  closeModal(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.closeIssueModal()
    }
  }

  viewIncidentDetails(): void {
    const issue = this.selectedIssue()
    if (issue) {
      void this.router.navigate(['/staff-manager/incidents', issue.issueId])
    }
  }

  formatDate(date: string): string {
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

  getStatusColor(status?: string): string {
    return STATUS_COLORS[status || 'NO_SLA'] || STATUS_COLORS['NO_SLA']
  }

  formatStatus(status?: string): string {
    if (!status) return 'N/A'
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  getImageUrl(path: string | null | undefined): string {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `http://localhost:5080/${path.replace(/^\//, '')}`
  }
}
