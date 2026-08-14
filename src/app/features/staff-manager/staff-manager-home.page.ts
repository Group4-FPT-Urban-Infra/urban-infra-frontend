import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { AuthStore } from '../../core/auth/auth.store'
import { DepartmentManagerService } from '../../core/services/department-manager.service'
import {
  DepartmentManagerDashboardStats,
  TeamWorkloadItem,
  DepartmentManagerIssueSummary,
} from '../../core/services/department-manager.service'

@Component({
  selector: 'app-staff-manager-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[var(--color-surface)] p-4 md:p-8">
      <!-- Page Header -->
      <header class="mb-6 flex items-end justify-between">
        <div>
          <h2 class="text-[36px] font-bold text-[var(--color-on-surface)]" style="letter-spacing: -0.02em; line-height: 44px;">
            Staff Manager Dashboard
          </h2>
          <p class="mt-1 text-[14px] text-[var(--color-on-surface-variant)]">
            Real-time operational overview for department management.
          </p>
        </div>
        <div class="hidden items-center gap-3 md:flex">
          <button class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] shadow-sm transition-all hover:bg-[var(--color-surface-container-low)]">
            <span class="material-symbols-outlined text-[16px]">calendar_month</span>
            Today
          </button>
          <button class="flex items-center gap-2 rounded-lg bg-[var(--color-primary-container)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary-container)] shadow-sm transition-all hover:opacity-90">
            <span class="material-symbols-outlined text-[16px]">download</span>
            Export
          </button>
        </div>
      </header>

      <!-- Bento Grid Layout -->
      <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <!-- Unassigned Incidents -->
        <div class="flex flex-col justify-between rounded-xl border border-[var(--color-surface-container-highest)] bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-start justify-between">
            <span class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Unassigned Incidents
            </span>
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-error-container)]/20 text-[var(--color-error)]">
              <span class="material-symbols-outlined text-[18px]">warning</span>
            </div>
          </div>
          <div>
            <h3 class="text-[36px] font-bold text-[var(--color-on-surface)]">{{ stats()?.unassignedCount ?? 0 }}</h3>
            <p class="mt-1 flex items-center gap-1 text-[11px] font-medium" [class.text-[var(--color-error)]]="stats()?.unassignedTrend && stats()!.unassignedTrend > 0" [class.text-[var(--color-secondary)]]="!stats()?.unassignedTrend || stats()!.unassignedTrend <= 0">
              <span class="material-symbols-outlined text-[14px]">{{ (stats()?.unassignedTrend ?? 0) > 0 ? 'trending_up' : 'trending_down' }}</span>
              {{ (stats()?.unassignedTrend ?? 0) > 0 ? '+' : '' }}{{ stats()?.unassignedTrend ?? 0 }} vs yesterday
            </p>
          </div>
        </div>

        <!-- Processing -->
        <div class="flex flex-col justify-between rounded-xl border border-[var(--color-surface-container-highest)] bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-start justify-between">
            <span class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Processing
            </span>
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-container)]/10 text-[var(--color-primary)]">
              <span class="material-symbols-outlined text-[18px]">autorenew</span>
            </div>
          </div>
          <div>
            <h3 class="text-[36px] font-bold text-[var(--color-on-surface)]">{{ stats()?.processingCount ?? 0 }}</h3>
            <p class="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--color-secondary)]">
              <span class="material-symbols-outlined text-[14px]">trending_up</span>
              Active assignments
            </p>
          </div>
        </div>

        <!-- Avg Response Time -->
        <div class="flex flex-col justify-between rounded-xl border border-[var(--color-surface-container-highest)] bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-start justify-between">
            <span class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Avg Response Time
            </span>
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-tertiary-container)]/10 text-[var(--color-tertiary)]">
              <span class="material-symbols-outlined text-[18px]">timer</span>
            </div>
          </div>
          <div>
            <h3 class="text-[36px] font-bold text-[var(--color-on-surface)]">{{ stats()?.avgResponseTimeMinutes ?? 0 }}<span class="text-[18px] text-[var(--color-on-surface-variant)] ml-1">m</span></h3>
            <p class="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--color-secondary)]">
              <span class="material-symbols-outlined text-[14px]">trending_down</span>
              This month average
            </p>
          </div>
        </div>

        <!-- SLA Breach Risks -->
        <div class="flex flex-col justify-between rounded-xl border border-[var(--color-surface-container-highest)] bg-white p-6 shadow-sm">
          <div class="mb-4 flex items-start justify-between">
            <span class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              SLA Breach Risks
            </span>
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-error)]/10 text-[var(--color-error)]">
              <span class="material-symbols-outlined text-[18px]">error</span>
            </div>
          </div>
          <div>
            <h3 class="text-[36px] font-bold text-[var(--color-error)]">{{ stats()?.slaBreachRisksCount ?? 0 }}</h3>
            <p class="mt-1 text-[11px] font-medium text-[var(--color-on-surface-variant)]">
              Requires immediate attention
            </p>
          </div>
        </div>
      </div>

      <!-- Main Content Split -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Unassigned Incidents Table -->
        <div class="flex flex-col overflow-hidden rounded-xl border border-[var(--color-surface-container-highest)] bg-white shadow-sm lg:col-span-2">
          <div class="flex items-center justify-between border-b border-[var(--color-outline-variant)]/30 bg-[var(--color-surface)]/50 px-6 py-4">
            <h3 class="text-[18px] font-semibold text-[var(--color-on-surface)]">Unassigned Incidents</h3>
            <a routerLink="/staff-manager/incidents" [queryParams]="{filter: 'unassigned'}" class="flex items-center gap-1 text-[12px] font-medium text-[var(--color-primary)] hover:underline">
              View All
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left">
              <thead>
                <tr class="bg-[var(--color-surface-container-low)] text-[11px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
                  <th class="border-b border-[var(--color-outline-variant)]/30 p-4 font-medium">ID</th>
                  <th class="border-b border-[var(--color-outline-variant)]/30 p-4 font-medium">Type</th>
                  <th class="border-b border-[var(--color-outline-variant)]/30 p-4 font-medium">Priority</th>
                  <th class="border-b border-[var(--color-outline-variant)]/30 p-4 font-medium">Time Logged</th>
                  <th class="border-b border-[var(--color-outline-variant)]/30 p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody class="text-[14px] text-[var(--color-on-surface)]">
                @for (issue of unassignedIssues(); track issue.issueId) {
                  <tr class="border-b border-[var(--color-outline-variant)]/20 transition-colors hover:bg-[var(--color-surface-container-lowest)]">
                    <td class="p-4 font-medium">{{ issue.publicCode }}</td>
                    <td class="p-4">{{ issue.issueTypeName }}</td>
                    <td class="p-4">
                      <span class="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium" [style.background-color]="issue.priorityColor + '20'" [style.color]="issue.priorityColor">
                        {{ issue.priorityName }}
                      </span>
                    </td>
                    <td class="p-4 text-[var(--color-on-surface-variant)]">{{ formatTimeAgo(issue.reportedAt) }}</td>
                    <td class="p-4">
                      <button (click)="openAssignModal(issue)" class="text-[12px] font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-container)]">
                        Assign
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="p-8 text-center text-[var(--color-on-surface-variant)]">
                      No unassigned incidents
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Team Workload Summary -->
        <div class="flex flex-col gap-6">
          <div class="flex flex-1 flex-col rounded-xl border border-[var(--color-surface-container-highest)] bg-white p-6 shadow-sm">
            <h3 class="mb-6 text-[18px] font-semibold text-[var(--color-on-surface)]">Team Workload</h3>
            <div class="flex flex-col gap-4">
              @for (member of workload(); track member.userId) {
                <div class="flex flex-col gap-1">
                  <div class="flex items-end justify-between text-[12px] font-medium">
                    <span class="text-[var(--color-on-surface)]">{{ member.fullName }}</span>
                    <span class="font-medium" [style.color]="getResolvedColor(member)">
                      {{ member.resolvedCount }} resolved
                    </span>
                  </div>
                  <div class="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-container-high)]">
                    <div class="h-2 rounded-full" [style.width.%]="getCapacity(member)" [style.background-color]="getCapacityColor(member)"></div>
                  </div>
                </div>
              } @empty {
                <p class="text-[var(--color-on-surface-variant)]">No team members found</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    @if (showAssignModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="closeAssignModal()">
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-[18px] font-semibold text-[var(--color-on-surface)]">Assign Incident</h3>
            <button (click)="closeAssignModal()" class="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          @if (selectedIssue()) {
            <div class="mb-4 rounded-lg bg-[var(--color-surface-container-low)] p-4">
              <p class="text-[14px] font-medium text-[var(--color-on-surface)]">{{ selectedIssue()!.publicCode }}</p>
              <p class="text-[12px] text-[var(--color-on-surface-variant)]">{{ selectedIssue()!.title }}</p>
            </div>
          }
          <div class="mb-4">
            <label class="mb-2 block text-[12px] font-medium text-[var(--color-on-surface-variant)]">Select Staff Member</label>
            <select [(ngModel)]="selectedUserId" class="w-full rounded-lg border border-[var(--color-outline)] bg-white px-3 py-2 text-[14px] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none">
              <option value="">Select a staff member...</option>
              @for (member of workload(); track member.userId) {
                <option [value]="member.userId">{{ member.fullName }} ({{ member.resolvedCount }} resolved)</option>
              }
            </select>
          </div>
          <div class="mb-4">
            <label class="mb-2 block text-[12px] font-medium text-[var(--color-on-surface-variant)]">Note (Optional)</label>
            <textarea [(ngModel)]="assignNote" rows="3" class="w-full rounded-lg border border-[var(--color-outline)] bg-white px-3 py-2 text-[14px] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none" placeholder="Add a note..."></textarea>
          </div>
          <div class="flex justify-end gap-3">
            <button (click)="closeAssignModal()" class="rounded-lg border border-[var(--color-outline)] px-4 py-2 text-[14px] font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-low)]">
              Cancel
            </button>
            <button (click)="confirmAssign()" [disabled]="!selectedUserId || isAssigning()" class="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[14px] font-medium text-[var(--color-on-primary)] hover:opacity-90 disabled:opacity-50">
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
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
    `,
  ],
})
export class StaffManagerHomeComponent implements OnInit {
  protected readonly authStore = inject(AuthStore)
  private readonly dmService = inject(DepartmentManagerService)

  stats = signal<DepartmentManagerDashboardStats | null>(null)
  workload = signal<TeamWorkloadItem[]>([])
  unassignedIssues = signal<DepartmentManagerIssueSummary[]>([])
  showAssignModal = signal(false)
  selectedIssue = signal<DepartmentManagerIssueSummary | null>(null)
  selectedUserId = ''
  assignNote = ''
  isAssigning = signal(false)

  ngOnInit(): void {
    this.loadData()
  }

  loadData(): void {
    this.dmService.getDashboardStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Failed to load stats:', err),
    })

    this.dmService.getTeamWorkload().subscribe({
      next: (data) => this.workload.set(data.members),
      error: (err) => console.error('Failed to load workload:', err),
    })

    this.dmService.getUnassignedIssues(1, 5).subscribe({
      next: (data) => this.unassignedIssues.set(data),
      error: (err) => console.error('Failed to load unassigned issues:', err),
    })
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
    this.dmService.assignIssue(issue.issueId, { userId: this.selectedUserId, note: this.assignNote || undefined }).subscribe({
      next: () => {
        this.closeAssignModal()
        this.isAssigning.set(false)
        this.loadData()
      },
      error: (err) => {
        console.error('Failed to assign:', err)
        this.isAssigning.set(false)
      },
    })
  }

  formatTimeAgo(date: string): string {
    return this.dmService.formatTimeAgo(date)
  }

  getCapacity(member: TeamWorkloadItem): number {
    const total = member.assignedCount
    if (total === 0) return 0
    return Math.min(100, (member.resolvedCount / total) * 100)
  }

  getCapacityColor(member: TeamWorkloadItem): string {
    const pct = this.getCapacity(member)
    if (pct >= 80) return '#F44336'
    if (pct >= 50) return '#FF9800'
    return '#4CAF50'
  }

  getResolvedColor(member: TeamWorkloadItem): string {
    return this.getCapacityColor(member)
  }
}
