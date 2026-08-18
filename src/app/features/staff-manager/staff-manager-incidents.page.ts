import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { DepartmentManagerService } from '../../core/services/department-manager.service'
import {
  DepartmentManagerIssueSummary,
  TeamWorkloadItem,
} from '../../core/services/department-manager.service'

@Component({
  selector: 'app-staff-manager-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[var(--color-background)] p-4 md:p-8">
      <!-- Page Header -->
      <div class="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2
            class="text-[36px] font-bold text-[var(--color-on-surface)]"
            style="letter-spacing: -0.02em; line-height: 44px;"
          >
            Active Incidents
          </h2>
          <p class="mt-1 max-w-2xl text-[14px] text-[var(--color-on-surface-variant)]">
            Review, filter, and reassign current departmental reports. Prioritize tasks nearing SLA
            breaches.
          </p>
        </div>
        <div class="flex gap-3">
          <span
            class="rounded-md bg-[var(--color-surface-container)] px-3 py-2 text-[12px] font-bold text-[var(--color-on-surface)]"
          >
            {{ totalCount() }} Active
          </span>
        </div>
      </div>

      <!-- Filter Bar -->
      <div
        class="mb-6 flex flex-col items-center gap-3 rounded-xl border border-[var(--color-outline-variant)]/30 bg-white p-4 shadow-sm lg:flex-row"
      >
        <!-- Search -->
        <div class="group relative w-full lg:w-72">
          <span
            class="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-[18px] text-[var(--color-outline)]"
            >search</span
          >
          <input
            type="text"
            [(ngModel)]="searchKeyword"
            (ngModelChange)="onSearchChange()"
            placeholder="Search ID, Title..."
            class="w-full rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pr-4 pl-10 text-[14px] shadow-sm transition-all focus:border-transparent focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          />
        </div>

        <div class="hidden h-8 w-px bg-[var(--color-outline-variant)]/30 lg:block"></div>

        <!-- Filters -->
        <div class="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <div class="relative">
            <select
              [(ngModel)]="selectedFilter"
              (ngModelChange)="loadIssues()"
              class="min-w-[150px] appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pr-10 pl-4 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            >
              <option value="">All Incidents</option>
              <option value="unassigned">Unassigned</option>
              <option value="team_assigned">Team Assigned</option>
              <option value="my_assigned">My Assigned</option>
            </select>
            <span
              class="material-symbols-outlined pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]"
              >expand_more</span
            >
          </div>

          <div class="relative">
            <select
              [(ngModel)]="selectedPriority"
              (ngModelChange)="loadIssues()"
              class="min-w-[130px] appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] py-2 pr-10 pl-4 text-[14px] shadow-sm transition-colors hover:bg-[var(--color-surface-container)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            >
              <option value="">Priority: All</option>
              <option value="1">Critical</option>
              <option value="2">High</option>
              <option value="3">Medium</option>
              <option value="4">Low</option>
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
            class="rounded-lg p-2 text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)] hover:text-[var(--color-primary)]"
            title="Clear Filters"
          >
            <span class="material-symbols-outlined text-[20px]">filter_alt_off</span>
          </button>
        </div>
      </div>

      <!-- Data Table -->
      <div
        class="overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/30 bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.02)]"
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead
              class="sticky top-0 z-10 border-b border-[var(--color-outline-variant)]/40 bg-white/90 text-[11px] font-bold tracking-wider text-[var(--color-on-surface-variant)] uppercase shadow-sm backdrop-blur-md"
            >
              <tr>
                <th class="w-12 border-r border-[var(--color-outline-variant)]/20 p-4 text-center">
                  #
                </th>
                <th
                  class="cursor-pointer p-4 transition-colors hover:bg-[var(--color-surface-container-low)]"
                >
                  ID / Title
                </th>
                <th
                  class="hidden cursor-pointer p-4 transition-colors hover:bg-[var(--color-surface-container-low)] sm:table-cell"
                >
                  Type
                </th>
                <th
                  class="cursor-pointer p-4 transition-colors hover:bg-[var(--color-surface-container-low)]"
                >
                  Priority
                </th>
                <th class="hidden p-4 md:table-cell">Status</th>
                <th class="hidden p-4 md:table-cell">SLA Status</th>
                <th class="hidden p-4 lg:table-cell">Members</th>
                <th class="hidden p-4 lg:table-cell">Reported</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-outline-variant)]/20 bg-white">
              @for (issue of issues(); track issue.issueId; let i = $index) {
                <tr class="cursor-default transition-colors hover:bg-[#F1F5F9]">
                  <td
                    class="border-r border-[var(--color-outline-variant)]/10 p-4 text-center text-[12px] text-[var(--color-on-surface-variant)]"
                  >
                    {{ (currentPage() - 1) * pageSize + i + 1 }}
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-[var(--color-surface-container)]"
                      >
                        <span
                          class="material-symbols-outlined text-[20px] text-[var(--color-on-surface-variant)]"
                          >report</span
                        >
                      </div>
                      <div>
                        <div class="text-[14px] font-semibold text-[var(--color-on-surface)]">
                          {{ issue.publicCode }}
                        </div>
                        <div
                          class="max-w-[200px] truncate text-[11px] text-[var(--color-on-surface-variant)]"
                        >
                          {{ issue.title }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="hidden p-4 sm:table-cell">
                    <span class="text-[14px] text-[var(--color-on-surface)]">{{
                      issue.issueTypeName
                    }}</span>
                  </td>
                  <td class="p-4">
                    <span
                      class="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold"
                      [style.border-color]="issue.priorityColor"
                      [style.color]="issue.priorityColor"
                    >
                      {{ issue.priorityName }}
                    </span>
                  </td>
                  <td class="hidden p-4 md:table-cell">
                    <span
                      class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium"
                      [style.background-color]="getIssueStatusColor(issue.issueStatus) + '20'"
                      [style.color]="getIssueStatusColor(issue.issueStatus)"
                    >
                      {{ issue.issueStatus }}
                    </span>
                  </td>
                  <td class="hidden p-4 md:table-cell">
                    <span
                      class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium"
                      [style.background-color]="getSlaStatusColor(issue.slaStatus) + '20'"
                      [style.color]="getSlaStatusColor(issue.slaStatus)"
                    >
                      {{ formatSlaStatus(issue.slaStatus) }}
                    </span>
                  </td>
                  <td class="hidden p-4 lg:table-cell">
                    <span
                      class="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-container)] px-2 py-1 text-[11px] font-medium text-[var(--color-on-surface-variant)]"
                    >
                      <span class="material-symbols-outlined text-[14px]">group</span>
                      {{ issue.assignedMemberCount }}
                    </span>
                  </td>
                  <td
                    class="hidden p-4 text-[14px] text-[var(--color-on-surface-variant)] lg:table-cell"
                  >
                    {{ formatDate(issue.reportedAt) }}
                  </td>
                  <td class="p-4 text-right">
                    <div class="flex justify-end gap-1">
                      <button
                        (click)="viewIncidentDetail(issue)"
                        class="rounded-md p-1 text-[var(--color-outline)] transition-colors hover:bg-[var(--color-primary-container)]/20 hover:text-[var(--color-primary)]"
                        title="View Details"
                      >
                        <span class="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="9" class="p-8 text-center text-[var(--color-on-surface-variant)]">
                    No incidents found
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
          <span class="text-[12px] text-[var(--color-on-surface-variant)]"
            >Showing {{ (currentPage() - 1) * pageSize + 1 }} to
            {{ Math.min(currentPage() * pageSize, totalCount()) }} of
            {{ totalCount() }} entries</span
          >
          <div class="flex items-center gap-1">
            <button
              (click)="prevPage()"
              [disabled]="currentPage() === 1"
              class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-outline-variant)] text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)] disabled:opacity-50"
            >
              <span class="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            @for (page of getPageNumbers(); track page) {
              <button
                (click)="goToPage(page)"
                class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-outline-variant)] text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]"
                [class.bg-[var(--color-primary)]]="page === currentPage()"
                [class.font-bold]="page === currentPage()"
                [class.text-[var(--color-on-primary)]]="page === currentPage()"
              >
                {{ page }}
              </button>
            }
            <button
              (click)="nextPage()"
              [disabled]="currentPage() >= totalPages()"
              class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-outline-variant)] text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)] disabled:opacity-50"
            >
              <span class="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    @if (showAssignModal()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        (click)="closeAssignModal()"
      >
        <div
          class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-[18px] font-semibold text-[var(--color-on-surface)]">
              Assign Incident
            </h3>
            <button
              (click)="closeAssignModal()"
              class="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          @if (selectedIssue()) {
            <div class="mb-4 rounded-lg bg-[var(--color-surface-container-low)] p-4">
              <p class="text-[14px] font-medium text-[var(--color-on-surface)]">
                {{ selectedIssue()!.publicCode }}
              </p>
              <p class="text-[12px] text-[var(--color-on-surface-variant)]">
                {{ selectedIssue()!.title }}
              </p>
            </div>
          }
          <div class="mb-4">
            <label class="mb-2 block text-[12px] font-medium text-[var(--color-on-surface-variant)]"
              >Select Staff Member</label
            >
            <select
              [(ngModel)]="selectedUserId"
              class="w-full rounded-lg border border-[var(--color-outline)] bg-white px-3 py-2 text-[14px] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              <option value="">Select a staff member...</option>
              @for (member of staffList(); track member.userId) {
                <option [value]="member.userId">{{ member.fullName }}</option>
              }
            </select>
          </div>
          <div class="mb-4">
            <label class="mb-2 block text-[12px] font-medium text-[var(--color-on-surface-variant)]"
              >Note (Optional)</label
            >
            <textarea
              [(ngModel)]="assignNote"
              rows="3"
              class="w-full rounded-lg border border-[var(--color-outline)] bg-white px-3 py-2 text-[14px] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none"
              placeholder="Add a note..."
            ></textarea>
          </div>
          <div class="flex justify-end gap-3">
            <button
              (click)="closeAssignModal()"
              class="rounded-lg border border-[var(--color-outline)] px-4 py-2 text-[14px] font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]"
            >
              Cancel
            </button>
            <button
              (click)="confirmAssign()"
              [disabled]="!selectedUserId || isAssigning()"
              class="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[14px] font-medium text-[var(--color-on-primary)] hover:opacity-90 disabled:opacity-50"
            >
              {{ isAssigning() ? 'Assigning...' : 'Assign' }}
            </button>
          </div>
        </div>
      </div>
    }
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
export class StaffManagerIncidentsComponent implements OnInit {
  private readonly dmService = inject(DepartmentManagerService)
  private readonly router = inject(Router)

  Math = Math

  issues = signal<DepartmentManagerIssueSummary[]>([])
  staffList = signal<TeamWorkloadItem[]>([])
  currentPage = signal(1)
  pageSize = 10
  totalCount = signal(0)

  selectedFilter = ''
  selectedPriority = ''
  searchKeyword = ''

  showAssignModal = signal(false)
  selectedIssue = signal<DepartmentManagerIssueSummary | null>(null)
  selectedUserId = ''
  assignNote = ''
  isAssigning = signal(false)

  ngOnInit(): void {
    this.loadIssues()
    this.loadStaff()
  }

  totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize) || 1
  }

  loadIssues(): void {
    const request: any = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize,
      filter: this.selectedFilter || undefined,
      keyword: this.searchKeyword || undefined,
    }
    if (this.selectedPriority) {
      request.priorityIds = [parseInt(this.selectedPriority)]
    }

    this.dmService.getIssues(request).subscribe({
      next: (data) => {
        this.issues.set(data.items)
        this.totalCount.set(data.totalCount)
      },
      error: (err) => console.error('Failed to load issues:', err),
    })
  }

  loadStaff(): void {
    this.dmService.getTeamWorkload().subscribe({
      next: (data) => this.staffList.set(data.members),
      error: (err) => console.error('Failed to load staff:', err),
    })
  }

  onSearchChange(): void {
    this.currentPage.set(1)
    this.loadIssues()
  }

  clearFilters(): void {
    this.selectedFilter = ''
    this.selectedPriority = ''
    this.searchKeyword = ''
    this.currentPage.set(1)
    this.loadIssues()
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1)
      this.loadIssues()
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1)
      this.loadIssues()
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page)
    this.loadIssues()
  }

  getPageNumbers(): number[] {
    const total = this.totalPages()
    const current = this.currentPage()
    const pages: number[] = []
    const start = Math.max(1, current - 2)
    const end = Math.min(total, start + 4)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  openAssignModal(issue: DepartmentManagerIssueSummary): void {
    this.selectedIssue.set(issue)
    this.selectedUserId = ''
    this.assignNote = ''
    this.showAssignModal.set(true)
  }

  closeAssignModal(): void {
    this.showAssignModal.set(false)
    this.selectedIssue.set(null)
  }

  confirmAssign(): void {
    const issue = this.selectedIssue()
    if (!issue || !this.selectedUserId) return

    this.isAssigning.set(true)
    this.dmService
      .assignIssue(issue.issueId, {
        userId: this.selectedUserId,
        note: this.assignNote || undefined,
      })
      .subscribe({
        next: () => {
          this.closeAssignModal()
          this.isAssigning.set(false)
          this.loadIssues()
        },
        error: (err) => {
          console.error('Failed to assign:', err)
          this.isAssigning.set(false)
        },
      })
  }

  formatDate(date: string): string {
    return this.dmService.formatDate(date)
  }

  formatSlaStatus(status?: string): string {
    if (!status) return 'N/A'
    switch (status) {
      case 'ON_TRACK':
        return 'On Track'
      case 'AT_RISK':
        return 'At Risk'
      case 'BREACHED':
        return 'Breached'
      case 'RESPONSE_BREACHED':
        return 'Response Breached'
      case 'RESOLVED':
        return 'Resolved'
      default:
        return status
    }
  }

  getSlaStatusColor(status?: string): string {
    return this.dmService.getSlaStatusColor(status)
  }

  getIssueStatusColor(status: string): string {
    switch (status) {
      case 'RESOLVED': return '#2196F3'
      case 'CLOSED': return '#9E9E9E'
      case 'BREACHED': return '#F44336'
      case 'RESPONSE_BREACHED': return '#FF5722'
      case 'AT_RISK': return '#FF9800'
      case 'ACTIVE': return '#4CAF50'
      default: return '#9E9E9E'
    }
  }

  viewIncidentDetail(issue: DepartmentManagerIssueSummary): void {
    void this.router.navigate(['/staff-manager/incidents', issue.issueId])
  }
}
