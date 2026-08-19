import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { AdminDashboardService } from './services/admin-dashboard.service'
import { PagedResponse, IssueSummaryResponse } from '../../core/services/dashboard.service'
import { AdminSidebarComponent } from './admin-sidebar.component'

interface ReportRow {
  id: string
  issueId: number
  title: string
  category: string
  categoryColor: string
  district: string
  status: string
  statusColor: string
  statusBg: string
  priority: string
  priorityColor: string
  isAssigned: boolean
  createdAt: string
}

@Component({
  selector: 'app-admin-incidents',
  standalone: true,
  imports: [CommonModule, AdminSidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-[var(--color-surface)]">
      <app-admin-sidebar />

      <div class="flex flex-1 flex-col overflow-y-auto pl-[280px]">
        <!-- Header -->
        <header class="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b px-8 backdrop-blur-md"
                style="background-color: var(--color-surface)/70; border-color: var(--color-outline-variant)">
          <div>
            <h1 class="text-[22px] font-bold tracking-tight" style="color: var(--color-on-surface)">Incident Reports</h1>
            <p class="text-[13px] font-medium" style="color: var(--color-on-surface-variant)">Manage all incidents</p>
          </div>
        </header>

        <main class="flex-1 p-8 max-w-7xl">
          <!-- Recent Reports Table -->
          <div class="rounded-2xl border overflow-hidden" style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.4)">
            <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color: rgba(195,198,215,0.4)">
              <h3 class="flex items-center gap-2 text-base font-semibold" style="color: var(--color-on-surface)">
                <span class="material-symbols-outlined" style="color: var(--color-primary); font-size:20px">assignment</span>
                Recent Incident Reports
              </h3>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b text-left" style="border-color: rgba(195,198,215,0.4); background-color: var(--color-surface-container-low)">
                    <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">ID</th>
                    <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">Title</th>
                    <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">Category</th>
                    <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">District</th>
                    <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">Status</th>
                    <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">Priority</th>
                    <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-center" style="color: var(--color-on-surface-variant)">Assigned</th>
                    <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-right" style="color: var(--color-on-surface-variant)">Reported At</th>
                  </tr>
                </thead>
                <tbody class="divide-y" style="divide-color: rgba(195,198,215,0.25)">
                  @if (recentIssuesLoading()) {
                    <tr>
                      <td colspan="8" class="px-6 py-12 text-center text-sm font-medium" style="color: var(--color-on-surface-variant)">
                        Loading reports...
                      </td>
                    </tr>
                  } @else if (recentIssuesError()) {
                    <tr>
                      <td colspan="8" class="px-6 py-12 text-center text-sm font-medium" style="color: var(--color-error)">
                        {{ recentIssuesError() }}
                      </td>
                    </tr>
                  } @else {
                    @for (row of mappedRecentIssues(); track row.id; let even = $even) {
                      <tr
                        class="border-b transition-colors hover:bg-[var(--color-surface-container-low)] cursor-pointer"
                        [style]="even ? 'background-color: var(--color-surface)' : 'background-color: var(--color-surface-container-lowest)'"
                        style="border-color: rgba(195,198,215,0.25)"
                        (click)="navigateToDetail(row.issueId)"
                      >
                        <td class="px-6 py-4 text-xs font-mono font-semibold" style="color: var(--color-primary)">{{ row.id }}</td>
                        <td class="px-6 py-4 font-medium max-w-[200px] truncate" style="color: var(--color-on-surface)">{{ row.title }}</td>
                        <td class="px-6 py-4">
                          <span class="rounded-full px-2.5 py-1 text-xs font-semibold" [style]="'background-color:' + row.categoryColor + '20; color:' + row.categoryColor">{{ row.category }}</span>
                        </td>
                        <td class="px-6 py-4 text-xs" style="color: var(--color-on-surface-variant)">{{ row.district }}</td>
                        <td class="px-6 py-4">
                          <span class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold w-fit" [style]="'background-color:' + row.statusBg + '; color:' + row.statusColor">
                            <span class="h-1.5 w-1.5 rounded-full" [style]="'background-color:' + row.statusColor"></span>
                            {{ row.status }}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <span class="rounded-full px-2.5 py-1 text-xs font-bold" [style]="'color:' + row.priorityColor">{{ row.priority }}</span>
                        </td>
                        <td class="px-6 py-4 text-center">
                          @if (row.isAssigned) {
                            <span class="material-symbols-outlined text-[20px]" style="color: var(--color-primary)">check_circle</span>
                          } @else {
                            <span class="material-symbols-outlined text-[20px]" style="color: var(--color-error)">cancel</span>
                          }
                        </td>
                        <td class="px-6 py-4 text-xs text-right" style="color: var(--color-on-surface-variant)">{{ row.createdAt }}</td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="flex items-center justify-between px-6 py-4 border-t" style="border-color: rgba(195,198,215,0.4); background-color: var(--color-surface-container-lowest)">
              <p class="text-xs" style="color: var(--color-on-surface-variant)">
                Showing 
                @if (recentIssuesData()) {
                  {{ (recentIssuesData()!.page - 1) * recentIssuesData()!.pageSize + 1 }} - {{ Math.min(recentIssuesData()!.page * recentIssuesData()!.pageSize, recentIssuesData()!.totalItems) }} of {{ recentIssuesData()!.totalItems }} results
                } @else {
                  0-0 of 0 results
                }
              </p>
              <div class="flex gap-1">
                <button
                  (click)="changePage(currentPage() - 1)"
                  [disabled]="currentPage() === 1"
                  class="flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors hover:bg-[var(--color-surface-container)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                @for (pg of getPaginationPages(); track pg) {
                  <button
                    (click)="changePage(pg)"
                    class="flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition-colors"
                    [style]="pg === currentPage()
                      ? 'background-color: var(--color-primary); border-color: var(--color-primary); color: white'
                      : 'border-color: var(--color-outline-variant); color: var(--color-on-surface); background: transparent'"
                  >{{ pg }}</button>
                }
                <button
                  (click)="changePage(currentPage() + 1)"
                  [disabled]="recentIssuesData() ? currentPage() === recentIssuesData()!.totalPages : true"
                  class="flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors hover:bg-[var(--color-surface-container)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `
})
export class AdminIncidentsPage implements OnInit {
  private readonly adminDashService = inject(AdminDashboardService)
  private readonly router = inject(Router)
  
  protected readonly Math = Math

  readonly recentIssuesLoading = signal(true)
  readonly recentIssuesError   = signal<string | null>(null)
  readonly recentIssuesData    = signal<PagedResponse<IssueSummaryResponse> | null>(null)
  readonly currentPage         = signal(1)

  ngOnInit(): void {
    this.loadRecentIssues()
  }

  loadRecentIssues(page: number = 1): void {
    this.currentPage.set(page)
    this.recentIssuesLoading.set(true)
    this.adminDashService.getRecentIssues(page).subscribe({
      next: (res) => {
        this.recentIssuesData.set(res.success ? res.data : null)
        if (!res.success) this.recentIssuesError.set(res.message ?? 'Failed to load issues.')
        this.recentIssuesLoading.set(false)
      },
      error: () => {
        this.recentIssuesError.set('Không thể tải danh sách sự cố.')
        this.recentIssuesLoading.set(false)
      }
    })
  }

  readonly mappedRecentIssues = computed((): ReportRow[] => {
    const data = this.recentIssuesData()
    if (!data || !data.items) return []
    
    return data.items.map((issue: IssueSummaryResponse) => {
      let priorityColor = 'var(--color-primary)'
      let priorityEmoji = '🔵'
      switch (issue.priority?.code?.toUpperCase()) {
        case 'CRITICAL':
          priorityColor = 'var(--color-error)'
          priorityEmoji = '🔴'
          break
        case 'HIGH':
          priorityColor = 'var(--color-tertiary)'
          priorityEmoji = '🟠'
          break
      }

      let statusColor = 'var(--color-on-surface-variant)'
      let statusBg = 'var(--color-surface-container)'
      const st = issue.status?.code?.toUpperCase() || ''
      if (st.includes('RESOLVED') || st.includes('CLOSED')) {
        statusColor = 'var(--color-secondary)'
        statusBg = 'rgba(0,108,73,0.12)'
      } else if (st.includes('PROGRESS') || st.includes('ESCALATED')) {
        statusColor = 'var(--color-tertiary)'
        statusBg = 'rgba(120,75,0,0.12)'
      } else if (st.includes('NEW') || st.includes('OPEN')) {
        statusColor = 'var(--color-primary)'
        statusBg = 'rgba(0,74,198,0.12)'
      }

      let catColor = 'var(--color-outline)'
      const cat = issue.issueType?.name?.toUpperCase() || ''
      if (cat.includes('INFRASTRUCTURE') || cat.includes('HẠ TẦNG')) catColor = 'var(--color-primary)'
      else if (cat.includes('SAFETY') || cat.includes('AN TOÀN')) catColor = 'var(--color-error)'
      else if (cat.includes('TRAFFIC') || cat.includes('GIAO THÔNG') || cat.includes('UTILITIES') || cat.includes('TIỆN ÍCH')) catColor = 'var(--color-tertiary)'
      else if (cat.includes('ENVIRONMENT') || cat.includes('MÔI TRƯỜNG')) catColor = 'var(--color-secondary)'

      return {
        id: issue.publicCode || `#IR-${issue.id}`,
        issueId: issue.id,
        title: issue.title,
        category: issue.issueType?.name || 'N/A',
        categoryColor: catColor,
        district: issue.area?.name || 'N/A',
        status: issue.status?.name || 'N/A',
        statusColor,
        statusBg,
        priority: `${priorityEmoji} ${issue.priority?.name || 'N/A'}`,
        priorityColor,
        isAssigned: issue.isAssigned || false,
        createdAt: new Date(issue.reportedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    })
  })

  changePage(newPage: number): void {
    if (newPage < 1) return
    const data = this.recentIssuesData()
    if (data && newPage > data.totalPages) return
    this.loadRecentIssues(newPage)
  }

  getPaginationPages(): number[] {
    const data = this.recentIssuesData()
    if (!data || data.totalPages === 0) return [1]
    
    const pages = []
    let start = Math.max(1, this.currentPage() - 2)
    let end = Math.min(data.totalPages, start + 4)
    if (end - start < 4) {
      start = Math.max(1, end - 4)
    }
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  navigateToDetail(issueId: number): void {
    void this.router.navigate(['/admin/incidents', issueId])
  }
}
