import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { DashboardService } from '../../core/services/dashboard.service'
import type { IssueSummaryResponse, PagedResponse, IssueTypeLookup, IssueStatusLookup } from '../../core/services/dashboard.service'

@Component({
  selector: 'app-citizen-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[var(--color-surface)] p-4 md:p-8">
      <!-- Page Header -->
      <div class="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 class="text-[28px] font-semibold text-[var(--color-on-surface)]" style="letter-spacing: -0.01em; line-height: 36px;">
            Incidents
          </h2>
          <p class="mt-1 text-[14px] text-[var(--color-on-surface-variant)]">
            Browse and track reported infrastructure issues across the city.
          </p>
        </div>
        <div class="flex w-full gap-2 md:w-auto">
          <div class="relative flex-1 md:w-64">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-outline)]"
              >search</span
            >
            <input
              type="text"
              class="w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] py-2 pl-10 pr-4 text-[14px] text-[var(--color-on-surface)] transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              placeholder="Search incidents..."
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
            />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-6 lg:flex-row">
        <!-- Filters Sidebar -->
        <aside
          class="sticky top-4 w-full rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-4 shadow-sm lg:w-[260px]"
        >
          <div class="flex items-center justify-between border-b border-[var(--color-outline-variant)] pb-4">
            <h3 class="text-[18px] font-semibold text-[var(--color-on-surface)]">Filters</h3>
            <button class="text-[12px] font-medium text-[var(--color-primary)] hover:underline">
              Clear All
            </button>
          </div>

          <!-- Status Filter -->
          <div class="flex flex-col gap-2 pt-4">
            <h4
              class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]"
            >
              Status
            </h4>
            @for (status of issueStatuses(); track status.statusId) {
              <label class="group flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  [checked]="selectedStatusIds().includes(status.statusId)"
                  (change)="onStatusToggle(status.statusId, $event)"
                  class="h-4 w-4 rounded border-[var(--color-outline)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span
                  class="text-[14px] text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors"
                >
                  {{ status.statusName }}
                </span>
              </label>
            }
          </div>

          <!-- Type Filter -->
          <div class="flex flex-col gap-2 border-t border-[var(--color-outline-variant)] pt-4">
            <h4
              class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]"
            >
              Type
            </h4>
            @for (type of issueTypes(); track type.issueTypeId) {
              <label class="group flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  [checked]="selectedTypeIds().includes(type.issueTypeId)"
                  (change)="onTypeToggle(type.issueTypeId, $event)"
                  class="h-4 w-4 rounded border-[var(--color-outline)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span
                  class="text-[14px] text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors"
                >
                  {{ type.typeName }}
                </span>
              </label>
            }
          </div>
        </aside>

        <!-- Cards Grid -->
        <div class="flex flex-1 flex-col gap-6">
          @if (isLoading()) {
            <div class="flex items-center justify-center py-20">
              <span class="material-symbols-outlined animate-spin text-4xl text-[var(--color-primary)]">
                progress_activity
              </span>
            </div>
          } @else if (issues().length === 0) {
            <div class="flex flex-col items-center justify-center py-20 text-[var(--color-on-surface-variant)]">
              <span class="material-symbols-outlined text-4xl">inbox</span>
              <p class="mt-4 text-lg">No incidents found</p>
              <p class="mt-2 text-sm">Try adjusting your filters or search query</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              @for (issue of issues(); track issue.id) {
                <div
                  class="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] shadow-sm transition-shadow hover:shadow-md"
                  (click)="viewDetail(issue.id)"
                >
                  <!-- Thumbnail -->
                  <div class="relative h-40 w-full bg-[var(--color-surface-variant)]">
                    @if (getImageUrl(issue.thumbnailUrl)) {
                      <img
                        [src]="getImageUrl(issue.thumbnailUrl)"
                        [alt]="issue.title"
                        class="h-full w-full object-cover"
                      />
                    } @else {
                      <div class="flex h-full w-full items-center justify-center">
                        <span class="material-symbols-outlined text-4xl text-[var(--color-outline)]">report</span>
                      </div>
                    }
                    <!-- Status Badge -->
                    <div class="absolute left-2 top-2 flex gap-1">
                      <span
                        class="rounded-full bg-[var(--color-surface)]/90 px-2 py-1 text-[11px] font-medium backdrop-blur-md"
                        [class]="getStatusBadgeClass(issue.status.code)"
                      >
                        {{ issue.status.name }}
                      </span>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="flex flex-1 flex-col gap-1 p-4">
                    <div class="flex items-start justify-between">
                      <span
                        class="rounded bg-[var(--color-primary-fixed)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-primary)]"
                      >
                        {{ issue.issueType.name }}
                      </span>
                      <span
                        class="flex items-center gap-1 text-[11px] font-medium"
                        [class]="getPriorityClass(issue.priority.code)"
                      >
                        @if (issue.priority.code === 'HIGH' || issue.priority.code === 'CRITICAL') {
                          <span class="material-symbols-outlined text-[14px]">priority_high</span>
                        }
                        {{ issue.priority.name }}
                      </span>
                    </div>
                    <h4 class="mt-1 line-clamp-2 text-[18px] font-semibold text-[var(--color-on-surface)]" style="line-height: 24px;">
                      {{ issue.title }}
                    </h4>
                    <p class="text-[14px] text-[var(--color-on-surface-variant)]">
                      {{ issue.area.name }}
                    </p>
                    <div
                      class="mt-auto flex items-center justify-between border-t border-[var(--color-surface-container)] pt-3"
                    >
                      <span class="flex items-center gap-1 text-[var(--color-outline)]">
                        <span class="material-symbols-outlined text-[16px]">thumb_up</span>
                        <span class="text-[12px]">{{ issue.upvoteCount }}</span>
                      </span>
                      <span class="text-[11px] text-[var(--color-outline)]">
                        {{ formatTimeAgo(issue.reportedAt) }}
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Pagination -->
            @if (totalPages() > 1) {
              <div class="mt-4 flex items-center justify-center gap-2">
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-container-high)] disabled:opacity-50"
                  [disabled]="currentPage() === 1"
                  (click)="goToPage(currentPage() - 1)"
                >
                  <span class="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                @for (page of getPageNumbers(); track page) {
                  @if (page === -1) {
                    <span class="px-2 text-[var(--color-outline)]">...</span>
                  } @else {
                    <button
                      class="flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-medium transition-colors"
                      [class.bg-[var(--color-primary)]]="currentPage() === page"
                      [class.text-[var(--color-on-primary)]]="currentPage() === page"
                      [class.border]="currentPage() !== page"
                      [class.border-[var(--color-outline-variant)]]="currentPage() !== page"
                      [class.text-[var(--color-on-surface)]]="currentPage() !== page"
                      [class.hover:bg-[var(--color-surface-container-high)]]="currentPage() !== page"
                      (click)="goToPage(page)"
                    >
                      {{ page }}
                    </button>
                  }
                }
                <button
                  class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-container-high)] disabled:opacity-50"
                  [disabled]="currentPage() === totalPages()"
                  (click)="goToPage(currentPage() + 1)"
                >
                  <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            }
          }
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
export class CitizenReportsComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService)
  private readonly router = inject(Router)

  issues = signal<IssueSummaryResponse[]>([])
  isLoading = signal(false)
  currentPage = signal(1)
  pageSize = 12
  totalPages = signal(1)
  totalItems = signal(0)
  searchQuery = ''

  // Filter data from API
  issueStatuses = signal<IssueStatusLookup[]>([])
  issueTypes = signal<IssueTypeLookup[]>([])
  selectedStatusIds = signal<number[]>([])
  selectedTypeIds = signal<number[]>([])

  ngOnInit(): void {
    this.loadFilterData()
    this.loadIssues()
  }

  loadFilterData(): void {
    // Load issue statuses
    this.dashboardService.getIssueStatuses().subscribe({
      next: (statuses) => {
        this.issueStatuses.set(statuses)
        // Select all by default
        this.selectedStatusIds.set(statuses.map(s => s.statusId))
      }
    })

    // Load issue types
    this.dashboardService.getIssueTypes().subscribe({
      next: (types) => {
        this.issueTypes.set(types)
        // Select all by default
        this.selectedTypeIds.set(types.map(t => t.issueTypeId))
      }
    })
  }

  onStatusToggle(statusId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement
    const current = this.selectedStatusIds()
    if (checkbox.checked) {
      this.selectedStatusIds.set([...current, statusId])
    } else {
      this.selectedStatusIds.set(current.filter(id => id !== statusId))
    }
    this.onFilterChange()
  }

  onTypeToggle(typeId: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement
    const current = this.selectedTypeIds()
    if (checkbox.checked) {
      this.selectedTypeIds.set([...current, typeId])
    } else {
      this.selectedTypeIds.set(current.filter(id => id !== typeId))
    }
    this.onFilterChange()
  }

  loadIssues(page = 1): void {
    this.isLoading.set(true)
    this.currentPage.set(page)

    // For now, load from latest issues endpoint
    this.dashboardService.getLatestIssues(100).subscribe({
      next: (issues) => {
        // Apply client-side filters
        let filtered = issues

        // Filter by selected status IDs
        if (this.selectedStatusIds().length > 0 && this.selectedStatusIds().length < this.issueStatuses().length) {
          filtered = filtered.filter(issue =>
            this.selectedStatusIds().includes(issue.status.id)
          )
        }

        // Filter by selected type IDs
        if (this.selectedTypeIds().length > 0 && this.selectedTypeIds().length < this.issueTypes().length) {
          filtered = filtered.filter(issue =>
            this.selectedTypeIds().includes(issue.issueType.id)
          )
        }

        // Apply search
        if (this.searchQuery.trim()) {
          const query = this.searchQuery.toLowerCase()
          filtered = filtered.filter(issue =>
            issue.title.toLowerCase().includes(query) ||
            issue.publicCode.toLowerCase().includes(query)
          )
        }

        // Apply pagination
        const start = (page - 1) * this.pageSize
        const end = start + this.pageSize
        this.issues.set(filtered.slice(start, end))
        this.totalItems.set(filtered.length)
        this.totalPages.set(Math.ceil(filtered.length / this.pageSize))
        this.isLoading.set(false)
      },
      error: () => {
        this.issues.set([])
        this.isLoading.set(false)
      },
    })
  }

  onSearch(): void {
    this.loadIssues(1)
  }

  onFilterChange(): void {
    this.loadIssues(1)
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.loadIssues(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = []
    const total = this.totalPages()
    const current = this.currentPage()

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (current > 3) {
        pages.push(-1) // ellipsis
      }
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i)
      }
      if (current < total - 2) {
        pages.push(-1) // ellipsis
      }
      pages.push(total)
    }

    return pages
  }

  viewDetail(id: number): void {
    void this.router.navigate(['/citizen/reports', id])
  }

  formatTimeAgo(date: string | Date): string {
    return this.dashboardService.formatTimeAgo(date)
  }

  getImageUrl(relativePath: string | null | undefined): string | null {
    return this.dashboardService.getImageUrl(relativePath)
  }

  getStatusBadgeClass(statusCode: string): string {
    const code = statusCode?.toUpperCase() || ''

    if (code === 'NEW' || code === 'OPEN') {
      return 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
    }
    if (code === 'IN_PROGRESS' || code === 'ASSIGNED') {
      return 'bg-[var(--color-tertiary-fixed)] text-[var(--color-on-tertiary-fixed)]'
    }
    if (code === 'RESOLVED' || code === 'CLOSED') {
      return 'bg-[var(--color-secondary-fixed)]/20 text-[var(--color-secondary)]'
    }

    return 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]'
  }

  getPriorityClass(priorityCode: string): string {
    const code = priorityCode?.toUpperCase() || ''

    if (code === 'CRITICAL' || code === 'HIGH') {
      return 'text-[var(--color-error)]'
    }
    if (code === 'MEDIUM') {
      return 'text-[var(--color-tertiary)]'
    }

    return 'text-[var(--color-on-surface-variant)]'
  }
}
