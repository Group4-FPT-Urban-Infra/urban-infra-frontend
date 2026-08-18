import { Component, computed, effect, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { StaffStore } from './staff.store'
import { StaffApiFilters } from './staff.types'

@Component({
  selector: 'app-staff-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[var(--color-surface)] p-4 md:p-6">
      <!-- Page Header -->
      <div class="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 class="text-[36px] font-bold text-[var(--color-on-surface)]" style="letter-spacing: -0.02em; line-height: 44px;">
            Incident Management
          </h2>
          <p class="mt-1 text-[14px] text-[var(--color-on-surface-variant)]">
            Review and manage assigned incidents.
          </p>
        </div>
        <div class="flex gap-3">
          <button class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] shadow-sm transition-all hover:bg-[var(--color-surface-container)]">
            <span class="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      @if (store.error() && !store.loading().claim) {
        <div class="mb-4 rounded-md bg-red-100 p-4 text-sm text-red-800" role="alert">
          <strong>Error:</strong> {{ store.error() }}
        </div>
      }

      <!-- Filter Bar -->
      <div class="mb-6 flex flex-col items-center gap-3 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] p-4 shadow-sm lg:flex-row">
        <!-- Search -->
        <div class="group relative w-full lg:w-72">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)] transition-colors group-focus-within:text-[var(--color-primary)]">search</span>
          <input
            type="text"
            placeholder="Search incidents..."
            class="w-full rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface)] py-2 pl-10 pr-4 text-[14px] shadow-sm transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:outline-none"
            [(ngModel)]="searchKeyword"
            (keyup.enter)="applyFilters()"
          />
        </div>

        <div class="hidden h-8 w-px bg-[var(--color-outline-variant)]/30 lg:block"></div>

        <!-- Filters -->
        <div class="flex w-full flex-wrap items-center gap-3 lg:flex-1">
          <!-- Assignment Filter -->
          <div class="relative">
            <select [(ngModel)]="selectedAssignment" (change)="applyFilters()" class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:outline-none min-w-[140px]">
              <option value="all">All Incidents</option>
              <option value="mine">My Incidents</option>
              <option value="unassigned">Unassigned</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>

          <!-- Priority Filter -->
          <div class="relative">
            <select [(ngModel)]="selectedPriority" (change)="applyFilters()" class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:outline-none min-w-[120px]">
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>

          <!-- Status Filter -->
          <div class="relative">
            <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="appearance-none rounded-lg border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface)] py-2 pl-4 pr-10 text-[14px] shadow-sm transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:outline-none min-w-[120px]">
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Unassigned">Unassigned</option>
            </select>
            <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">expand_more</span>
          </div>
        </div>

        <div class="flex items-center gap-2 lg:ml-auto">
          <button (click)="clearFilters()" class="rounded-lg p-2 text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)] hover:text-[var(--color-primary)]" title="Clear Filters">
            <span class="material-symbols-outlined text-[20px]">filter_alt_off</span>
          </button>
        </div>
      </div>

      <!-- Data Table -->
      <div class="overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr class="border-b border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)] text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                <th class="w-12 p-4 text-center">
                  <input type="checkbox" class="h-4 w-4 cursor-pointer rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                </th>
                <th class="p-4 font-semibold">Incident</th>
                <th class="p-4 font-semibold">Incident Type</th>
                <th class="p-4 font-semibold">Location / District</th>
                <th class="p-4 font-semibold">Priority</th>
                <th class="p-4 font-semibold">Status</th>
                <th class="p-4 font-semibold">Assigned To</th>
                <th class="p-4 font-semibold">SLA</th>
                <th class="p-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-surface-container)] text-[14px]">
              @if (store.loading().incidents) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr class="animate-pulse">
                    <td class="p-4"><div class="h-4 w-4 rounded bg-gray-200"></div></td>
                    <td class="p-4"><div class="h-4 rounded bg-gray-200"></div></td>
                    <td class="p-4"><div class="h-4 rounded bg-gray-200"></div></td>
                    <td class="p-4"><div class="h-4 rounded bg-gray-200"></div></td>
                    <td class="p-4"><div class="h-4 rounded bg-gray-200"></div></td>
                    <td class="p-4"><div class="h-4 rounded bg-gray-200"></div></td>
                    <td class="p-4"><div class="h-4 rounded bg-gray-200"></div></td>
                    <td class="p-4"><div class="h-4 rounded bg-gray-200"></div></td>
                    <td class="p-4"><div class="h-4 rounded bg-gray-200"></div></td>
                  </tr>
                }
              } @else if (incidents().length === 0) {
                <tr>
                  <td colspan="9" class="p-8 text-center text-sm text-[var(--color-on-surface-variant)]">
                    No incidents found for the selected filters.
                  </td>
                </tr>
              } @else {
                @for (incident of incidents(); track incident.id) {
                <tr
                  class="group cursor-pointer transition-colors hover:bg-[#F1F5F9]"
                  (click)="viewDetail(incident.id)"
                >
                  <td class="p-4 text-center" (click)="$event.stopPropagation()">
                    <input type="checkbox" class="h-4 w-4 cursor-pointer rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  </td>
                  <td class="p-4 font-medium text-[var(--color-primary)]">{{ incident.id }}</td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                        <span class="material-symbols-outlined text-[18px]">{{ incident.typeIcon }}</span>
                      </div>
                      <div>
                        <p class="font-medium text-[var(--color-on-surface)]">{{ incident.type }}</p>
                        <p class="text-[11px] text-[var(--color-outline)]">Reported {{ incident.reportedAt }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-4">
                    <p class="text-[var(--color-on-surface)]">{{ incident.location }}</p>
                    <p class="text-[11px] text-[var(--color-outline)]">{{ incident.district }}</p>
                  </td>
                  <td class="p-4">
                    <span [class]="getPriorityClass(incident.priority)" class="text-[11px] inline-flex items-center rounded-full px-2 py-1 font-bold">
                      {{ incident.priority }}
                    </span>
                  </td>
                  <td class="p-4">
                    <div class="relative inline-block w-full">
                      <select (click)="$event.stopPropagation()" [class]="getStatusClass(incident.status)" class="text-[11px] w-full cursor-pointer appearance-none rounded-full border-none py-1 pl-3 pr-8 font-bold outline-none focus:ring-2">
                        <option value="open" [selected]="incident.status === 'Open'">Open</option>
                        <option value="in_progress" [selected]="incident.status === 'In Progress'">In Progress</option>
                        <option value="resolved" [selected]="incident.status === 'Resolved'">Resolved</option>
                        <option value="unassigned" [selected]="incident.status === 'Unassigned'">Unassigned</option>
                      </select>
                      <span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px]">arrow_drop_down</span>
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-2">
                      <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-container)] text-[10px] font-bold text-[var(--color-on-primary-container)]">
                        {{ incident.assignedInitials }}
                      </div>
                      <span class="text-[var(--color-on-surface)]">{{ incident.assignedTo }}</span>
                    </div>
                  </td>
                  <td class="p-4">
                    <span [class]="getSlaClass(incident.slaStatus)" class="text-[11px] inline-flex items-center rounded-full px-2 py-1 font-bold">
                      {{ incident.slaStatus || 'N/A' }}
                    </span>
                  </td>
                  <td class="p-4 text-right" (click)="$event.stopPropagation()">
                    <div class="flex justify-end gap-1">
                      @if (incident.status === 'Unassigned') {
                        <button
                          class="flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700 transition-colors hover:bg-blue-200 disabled:opacity-50 disabled:cursor-wait"
                          (click)="claimIncident(incident.id)"
                          [disabled]="claimingIncidentId() === incident.id"
                          title="Get Incident"
                        >
                          <span class="material-symbols-outlined text-[16px]">{{ claimingIncidentId() === incident.id ? 'progress_activity' : 'add_task' }}</span>
                          {{ claimingIncidentId() === incident.id ? 'Claiming...' : 'Get' }}
                        </button>
                      }
                      <button class="p-1 text-[var(--color-outline)] transition-colors hover:text-[var(--color-primary)]">
                        <span class="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button class="p-1 text-[var(--color-outline)] transition-colors hover:text-[var(--color-primary)]">
                        <span class="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </div>
                  </td>
                </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between border-t border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)] p-4">
          <p class="text-[12px] text-[var(--color-on-surface-variant)]">{{ paginationSummary() }}</p>
          @if (pagination().totalPages > 1) {
            <div class="flex items-center gap-1">
              <button
                (click)="changePage(pagination().page - 1)"
                [disabled]="pagination().page === 1"
                class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span class="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              @for (page of getPageNumbers(); track $index) {
                @if (page === '...') {
                  <span class="px-1 text-[var(--color-outline)]">...</span>
                } @else {
                  <button
                    (click)="changePage(+page)"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-medium transition-colors"
                    [class.bg-[var(--color-primary)]]="pagination().page === page"
                    [class.text-[var(--color-on-primary)]]="pagination().page === page"
                    [class.font-bold]="pagination().page === page"
                    [class.border]="pagination().page !== page"
                    [class.border-[var(--color-outline-variant)]]="pagination().page !== page"
                    [class.text-[var(--color-on-surface)]]="pagination().page !== page"
                    [class.hover:bg-[var(--color-surface-container)]]="pagination().page !== page"
                  >
                    {{ page }}
                  </button>
                }
              }
              <button (click)="changePage(pagination().page + 1)" [disabled]="pagination().page === pagination().totalPages" class="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container)] disabled:cursor-not-allowed disabled:opacity-50">
                <span class="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
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
      .material-symbols-outlined.progress_activity {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
  ],
})
export class StaffIncidentsComponent implements OnInit {
  private readonly router = inject(Router)
  protected readonly store = inject(StaffStore)

  incidents = this.store.incidents
  pagination = this.store.pagination
  claimingIncidentId = signal<string | null>(null)

  // Local model bindings for Form Controls
  searchKeyword = ''
  selectedAssignment = 'all'
  selectedPriority = ''
  selectedStatus = ''
  currentPage = 1
  pageSize = 10

  constructor() {
    effect(() => {
      if (!this.store.loading().claim) {
        this.claimingIncidentId.set(null)
      }
    })
  }

  ngOnInit(): void {
    this.applyFilters()
  }

  applyFilters(): void {
    const filters: StaffApiFilters = {
      search: this.searchKeyword.trim() || undefined,
      onlyMine: this.selectedAssignment === 'mine',
      unassignedOnly: this.selectedAssignment === 'unassigned',
      priorities: this.selectedPriority ? [this.selectedPriority] : undefined,
      statuses: this.selectedStatus ? [this.selectedStatus] : undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
    }

    this.store.loadIncidents(filters)
  }

  clearFilters(): void {
    this.searchKeyword = ''
    this.selectedAssignment = 'all'
    this.selectedPriority = ''
    this.selectedStatus = ''
    this.currentPage = 1
    this.applyFilters()
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.pagination().totalPages && page !== this.currentPage) {
      this.currentPage = page
      this.applyFilters()
    }
  }

  paginationSummary = computed(() => {
    const p = this.pagination()
    if (p.totalItems === 0) {
      return '0 entries'
    }
    const start = (p.page - 1) * p.pageSize + 1
    const end = Math.min(p.page * p.pageSize, p.totalItems)
    return `Showing ${start} to ${end} of ${p.totalItems} entries`
  })

  getPageNumbers(): (number | string)[] {
    const total = this.pagination().totalPages
    const current = this.pagination().page
    if (total <= 1) return []

    const pages: (number | string)[] = []
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

  viewDetail(id: string): void {
    const numericId = id.replace(/#?INC-/, '')
    this.router.navigate(['/staff/incidents', numericId])
  }

  claimIncident(id: string): void {
    if (confirm('Are you sure you want to claim this incident?')) {
      this.claimingIncidentId.set(id)
      this.store.claimIncident(id)
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Critical':
        return 'bg-[#FEE2E2] text-[#991B1B]'
      case 'High':
        return 'bg-[#FEF3C7] text-[#92400E]'
      case 'Medium':
        return 'bg-[#DBEAFE] text-[#1E40AF]'
      case 'Low':
        return 'bg-[#F1F5F9] text-[#475569]'
      default:
        return 'bg-[#F1F5F9] text-[#475569]'
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'bg-[#FEF3C7] text-[#92400E]'
      case 'In Progress':
        return 'bg-[#DBEAFE] text-[#1E40AF]'
      case 'Resolved':
        return 'bg-[#DCFCE7] text-[#166534]'
      default:
        return 'bg-[#F1F5F9] text-[#475569]'
    }
  }

  getSlaClass(slaStatus: string | undefined): string {
    switch (slaStatus) {
      case 'Breached':
        return 'bg-red-100 text-red-800'
      case 'At Risk':
        return 'bg-yellow-100 text-yellow-800'
      case 'On Target':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }
}