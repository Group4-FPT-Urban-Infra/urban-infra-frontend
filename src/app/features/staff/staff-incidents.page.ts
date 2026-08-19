import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { StaffService, StaffIncidentResponse, LookupItemResponse } from './staff.service'
import { DashboardService } from '../../core/services/dashboard.service'

@Component({
  selector: 'app-staff-incidents',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[var(--color-surface-bright)] p-4 md:p-6">
      <!-- Page Header -->
      <div class="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2
            class="text-[36px] font-bold text-[var(--color-on-surface)]"
            style="letter-spacing: -0.02em; line-height: 44px;"
          >
            Incident Management
          </h2>
          <p class="mt-1 text-[14px] text-[var(--color-on-surface-variant)]">
            @if (selectedScope === 'my') {
              Your assigned incidents
            } @else if (selectedScope === 'department') {
              Incidents assigned to your department
            } @else {
              All incidents in the system
            }
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            (click)="refresh()"
            [disabled]="isLoading()"
            class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-white px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] shadow-sm transition-all hover:bg-[var(--color-surface-container)] disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-[18px]" [class.animate-spin]="isLoading()">sync</span>
            Refresh
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div
        class="mb-6 flex flex-col items-center gap-3 rounded-xl border border-[var(--color-outline-variant)]/30 bg-white p-4 shadow-sm lg:flex-row"
      >
        <!-- Search -->
        <div class="group relative w-full lg:w-72">
          <span
            class="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-[18px] text-[var(--color-outline)] transition-colors group-focus-within:text-[var(--color-primary)]"
            >search</span
          >
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Search by code or title..."
            class="w-full rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pr-4 pl-10 text-[14px] shadow-sm transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          />
        </div>

        <div class="hidden h-8 w-px bg-[var(--color-outline-variant)]/30 lg:block"></div>

        <!-- Scope Filter -->
        <div class="relative">
          <select
            [(ngModel)]="selectedScope"
            (ngModelChange)="onScopeChange()"
            class="min-w-[160px] appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pr-10 pl-4 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          >
            <option value="my">My Issues</option>
            <option value="department">Department</option>
            <option value="all">All Issues</option>
          </select>
          <span
            class="material-symbols-outlined pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]"
            >expand_more</span
          >
        </div>

        <!-- Filters -->
        <div class="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <div class="relative">
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="applyFilters()"
              class="min-w-[140px] appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pr-10 pl-4 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            >
              <option value="">Status (All)</option>
              @for (status of issueStatuses(); track status.statusId) {
                <option [value]="status.statusCode">{{ status.statusName }}</option>
              }
            </select>
            <span
              class="material-symbols-outlined pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]"
              >expand_more</span
            >
          </div>

          <div class="relative">
            <select
              [(ngModel)]="selectedPriority"
              (ngModelChange)="applyFilters()"
              class="min-w-[120px] appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pr-10 pl-4 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            >
              <option value="">Priority (All)</option>
              @for (priority of priorities; track priority.id) {
                <option [value]="priority.id">{{ priority.name }}</option>
              }
            </select>
            <span
              class="material-symbols-outlined pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]"
              >expand_more</span
            >
          </div>

          <div class="relative">
            <select
              [(ngModel)]="selectedIssueType"
              (ngModelChange)="applyFilters()"
              class="min-w-[140px] appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pr-10 pl-4 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            >
              <option value="">Type (All)</option>
              @for (type of issueTypes(); track type.issueTypeId) {
                <option [value]="type.issueTypeId">{{ type.typeName }}</option>
              }
            </select>
            <span
              class="material-symbols-outlined pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]"
              >expand_more</span
            >
          </div>
        </div>

        <div class="flex items-center gap-2 lg:ml-auto">
          <button
            (click)="clearFilters()"
            class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)]/50 bg-white px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] shadow-sm transition-colors hover:bg-[var(--color-surface-container)]"
          >
            <span class="material-symbols-outlined text-[18px]">filter_alt_off</span>
            Clear
          </button>
        </div>
      </div>

      <!-- Data Table -->
      <div
        class="overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/30 bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
      >
        @if (isLoading()) {
          <div class="flex items-center justify-center p-12">
            <span class="material-symbols-outlined animate-spin text-4xl text-[var(--color-primary)]">progress_activity</span>
          </div>
        } @else if (incidents().length === 0) {
          <div class="flex flex-col items-center justify-center p-12 text-center">
            <span class="material-symbols-outlined text-6xl text-[var(--color-outline)]">inbox</span>
            <h3 class="mt-4 text-lg font-semibold text-[var(--color-on-surface)]">No incidents found</h3>
            <p class="mt-2 text-sm text-[var(--color-on-surface-variant)]">
              Try adjusting your filters or check back later.
            </p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full min-w-[1000px] border-collapse text-left">
              <thead>
                <tr
                  class="bg-[var(--color-surface-container-low)] border-b border-[var(--color-outline-variant)]/40 text-[12px] font-medium tracking-wider text-[var(--color-on-surface-variant)] uppercase"
                >
                  <th class="p-4 font-semibold">ID</th>
                  <th class="p-4 font-semibold">Incident Type</th>
                  <th class="p-4 font-semibold">Title</th>
                  <th class="p-4 font-semibold">Area</th>
                  <th class="p-4 font-semibold">Priority</th>
                  <th class="p-4 font-semibold">Status</th>
                  <th class="p-4 font-semibold">Assignment</th>
                  <th class="p-4 font-semibold">Reported</th>
                  <th class="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--color-surface-container)] text-[14px]">
                @for (incident of incidents(); track incident.issueId) {
                  <tr
                    class="group cursor-pointer transition-colors hover:bg-[var(--color-surface-container-low)]"
                    [routerLink]="['/staff/incidents', incident.issueId]"
                  >
                    <td class="p-4">
                      <div class="flex flex-col">
                        <span class="font-medium text-[var(--color-primary)]">{{ incident.publicCode }}</span>
                        @if (incident.isSlaBreached) {
                          <span class="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-error)]">
                            <span class="material-symbols-outlined text-[12px]">warning</span>
                            SLA BREACHED
                          </span>
                        }
                      </div>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <div
                          class="flex h-10 w-10 items-center justify-center rounded-lg"
                          [ngClass]="getTypeBgClass(incident.issueType.code)"
                        >
                          <span class="material-symbols-outlined text-[20px]" [ngClass]="getTypeIconColorClass(incident.issueType.code)">
                            {{ getTypeIcon(incident.issueType.code) }}
                          </span>
                        </div>
                        <span class="text-[var(--color-on-surface)]">{{ incident.issueType.name }}</span>
                      </div>
                    </td>
                    <td class="p-4">
                      <p class="max-w-[250px] text-[var(--color-on-surface)] line-clamp-2">
                        {{ incident.title }}
                      </p>
                    </td>
                    <td class="p-4">
                      <span class="text-[var(--color-on-surface-variant)]">{{ incident.area.name }}</span>
                    </td>
                    <td class="p-4">
                      <span
                        class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        [ngClass]="getPriorityBadgeClass(incident.priority.code)"
                      >
                        {{ incident.priority.name }}
                      </span>
                    </td>
                    <td class="p-4">
                      <span
                        class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
                        [ngClass]="getStatusBadgeClass(incident.status.code)"
                      >
                        {{ incident.status.name }}
                      </span>
                    </td>
                    <td class="p-4">
                      @if (incident.assignmentStatus) {
                        <span
                          class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium"
                          [ngClass]="getAssignmentBadgeClass(incident.assignmentStatus)"
                        >
                          {{ getAssignmentStatusLabel(incident.assignmentStatus) }}
                        </span>
                      } @else {
                        <span class="text-[var(--color-outline)]">-</span>
                      }
                    </td>
                    <td class="p-4">
                      <span class="text-[var(--color-on-surface-variant)]">{{ formatDateTime(incident.reportedAt) }}</span>
                    </td>
                    <td class="p-4 text-right" (click)="$event.stopPropagation()">
                      <div class="flex justify-end gap-1">
                        <a
                          [routerLink]="['/staff/incidents', incident.issueId]"
                          class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-container)]"
                        >
                          <span class="material-symbols-outlined text-[18px]">visibility</span>
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div
            class="flex items-center justify-between border-t border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-bright)] p-4"
          >
            <p class="text-[12px] text-[var(--color-on-surface-variant)]">
              Showing {{ (currentPage() - 1) * pageSize + 1 }} to {{ Math.min(currentPage() * pageSize, totalItems()) }} of {{ totalItems() }} entries
            </p>
            <div class="flex items-center gap-1">
              <button
                (click)="goToPage(currentPage() - 1)"
                [disabled]="currentPage() <= 1"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)] disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              @for (page of getVisiblePages(); track page) {
                @if (page === '...') {
                  <span class="px-2 text-[var(--color-outline)]">...</span>
                } @else {
                  <button
                    (click)="goToPage(+page)"
                    [ngClass]="currentPage() === +page
                      ? 'bg-[var(--color-primary)] font-bold text-[var(--color-on-primary)]'
                      : 'border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]'"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-medium transition-colors"
                  >
                    {{ page }}
                  </button>
                }
              }
              <button
                (click)="goToPage(currentPage() + 1)"
                [disabled]="currentPage() >= totalPages()"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)] disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        }
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
    `,
  ],
})
export class StaffIncidentsComponent implements OnInit {
  private readonly staffService = inject(StaffService)
  private readonly dashboardService = inject(DashboardService)
  private readonly router = inject(Router)
  protected readonly Math = Math

  // Data
  incidents = signal<StaffIncidentResponse[]>([])
  issueTypes = signal<any[]>([])
  issueStatuses = signal<any[]>([])
  priorities = [
    { id: 1, name: 'Critical' },
    { id: 2, name: 'High' },
    { id: 3, name: 'Medium' },
    { id: 4, name: 'Low' },
  ]

  // Loading state
  isLoading = signal(false)

  // Pagination
  currentPage = signal(1)
  pageSize = 20
  totalItems = signal(0)
  totalPages = signal(1)

  // Filters
  selectedScope = 'my'
  selectedStatus = ''
  selectedPriority = ''
  selectedIssueType = ''
  searchQuery = ''
  private searchTimeout: any

  ngOnInit(): void {
    this.loadFilterData()
    this.loadIncidents()
  }

  private loadFilterData(): void {
    this.dashboardService.getIssueTypes().subscribe({
      next: (types) => this.issueTypes.set(types)
    })
    this.dashboardService.getIssueStatuses().subscribe({
      next: (statuses) => this.issueStatuses.set(statuses)
    })
  }

  loadIncidents(): void {
    this.isLoading.set(true)

    const filters: any = {
      page: this.currentPage(),
      pageSize: this.pageSize,
      scope: this.selectedScope as 'my' | 'department' | 'all',
    }

    if (this.selectedStatus) {
      filters.statusCodes = [this.selectedStatus]
    }
    if (this.selectedPriority) {
      filters.priorityIds = [parseInt(this.selectedPriority)]
    }
    if (this.selectedIssueType) {
      filters.issueTypeIds = [parseInt(this.selectedIssueType)]
    }
    if (this.searchQuery) {
      filters.keyword = this.searchQuery
    }

    this.staffService.getIncidents(filters).subscribe({
      next: (response: any) => {
        if (response.items) {
          this.incidents.set(response.items)
          this.totalItems.set(response.totalItems || 0)
          this.totalPages.set(response.totalPages || 1)
        } else {
          this.incidents.set(response || [])
          this.totalItems.set(Array.isArray(response) ? response.length : 0)
          this.totalPages.set(1)
        }
        this.isLoading.set(false)
      },
      error: (err) => {
        console.error('Failed to load incidents:', err)
        this.isLoading.set(false)
      },
    })
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout)
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1)
      this.loadIncidents()
    }, 300)
  }

  onScopeChange(): void {
    this.currentPage.set(1)
    this.loadIncidents()
  }

  applyFilters(): void {
    this.currentPage.set(1)
    this.loadIncidents()
  }

  clearFilters(): void {
    this.selectedScope = 'department'
    this.selectedStatus = ''
    this.selectedPriority = ''
    this.selectedIssueType = ''
    this.searchQuery = ''
    this.currentPage.set(1)
    this.loadIncidents()
  }

  refresh(): void {
    this.loadIncidents()
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return
    this.currentPage.set(page)
    this.loadIncidents()
  }

  getVisiblePages(): (string | number)[] {
    const current = this.currentPage()
    const total = this.totalPages()
    const pages: (string | number)[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push('...')
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i)
      }
      if (current < total - 2) pages.push('...')
      pages.push(total)
    }

    return pages
  }

  formatTimeAgo(dateStr: string): string {
    return this.staffService.formatTimeAgo(dateStr)
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes} ${day}/${month}/${year}`
  }

  getTypeBgClass(typeCode: string): string {
    const code = typeCode?.toUpperCase() || ''
    if (code === 'LIGHT') return 'bg-amber-100'
    if (code === 'POTHOLE') return 'bg-red-100'
    if (code === 'FLOOD') return 'bg-blue-100'
    if (code === 'TRASH') return 'bg-green-100'
    if (code === 'SIGN') return 'bg-purple-100'
    return 'bg-gray-100'
  }

  getTypeIconColorClass(typeCode: string): string {
    const code = typeCode?.toUpperCase() || ''
    if (code === 'LIGHT') return 'text-amber-600'
    if (code === 'POTHOLE') return 'text-red-600'
    if (code === 'FLOOD') return 'text-blue-600'
    if (code === 'TRASH') return 'text-green-600'
    if (code === 'SIGN') return 'text-purple-600'
    return 'text-gray-600'
  }

  getTypeIcon(typeCode: string): string {
    const code = typeCode?.toUpperCase() || ''
    if (code === 'LIGHT') return 'lightbulb'
    if (code === 'POTHOLE') return 'warning'
    if (code === 'FLOOD') return 'water'
    if (code === 'TRASH') return 'delete'
    if (code === 'SIGN') return 'signpost'
    return 'report'
  }

  getPriorityBadgeClass(priorityCode: string): string {
    const code = priorityCode?.toUpperCase() || ''
    if (code === 'CRITICAL') return 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
    if (code === 'HIGH') return 'bg-orange-100 text-orange-800'
    if (code === 'MEDIUM') return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  getStatusBadgeClass(statusCode: string): string {
    const code = statusCode?.toUpperCase() || ''
    if (code === 'NEW' || code === 'ASSIGNED' || code === 'PENDING_INFO') {
      return 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]'
    }
    if (code === 'IN_PROGRESS') {
      return 'bg-blue-100 text-blue-800'
    }
    if (code === 'RESOLVED' || code === 'CLOSED') {
      return 'bg-green-100 text-green-800'
    }
    if (code === 'REJECTED') {
      return 'bg-red-100 text-red-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  getAssignmentBadgeClass(status: string): string {
    const code = status?.toUpperCase() || ''
    if (code === 'PENDING') {
      return 'bg-yellow-100 text-yellow-800'
    }
    if (code === 'ACCEPTED') {
      return 'bg-blue-100 text-blue-800'
    }
    if (code === 'COMPLETED') {
      return 'bg-green-100 text-green-800'
    }
    if (code === 'REJECTED') {
      return 'bg-red-100 text-red-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  getAssignmentStatusLabel(status: string): string {
    const code = status?.toUpperCase() || ''
    if (code === 'PENDING') return 'Pending'
    if (code === 'ACCEPTED') return 'Accepted'
    if (code === 'COMPLETED') return 'Completed'
    if (code === 'REJECTED') return 'Rejected'
    return status
  }
}
