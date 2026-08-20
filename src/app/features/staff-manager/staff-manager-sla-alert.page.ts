import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DepartmentManagerService } from '../../core/services/department-manager.service'
import { SlaOverview, SlaNearDeadlineItem, SlaHistoryItem } from '../../core/services/department-manager.service'

@Component({
  selector: 'app-staff-manager-sla-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[var(--color-surface)] p-4 md:p-8">
      <!-- Page Header -->
      <div class="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 class="text-[36px] font-bold text-[var(--color-on-surface)]" style="letter-spacing: -0.02em; line-height: 44px;">
            SLA Monitoring
          </h2>
          <p class="mt-1 text-[14px] text-[var(--color-on-surface-variant)]">
            Real-time tracking of response times and threshold compliance.
          </p>
        </div>
        <div class="flex gap-4">
          <button class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-low)]">
            <span class="material-symbols-outlined text-[18px]">tune</span>
            Configure Thresholds
          </button>
          <button class="flex items-center gap-2 rounded-lg bg-[var(--color-primary-container)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary-container)] transition-opacity hover:opacity-90">
            <span class="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      <!-- Bento Grid Layout -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-12">
        <!-- Approaching Breach (Priority Area) -->
        <div class="flex flex-col rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm md:col-span-8">
          <div class="mb-4 flex items-center justify-between border-b border-[var(--color-outline-variant)] pb-4">
            <h3 class="flex items-center gap-2 text-[18px] font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-[var(--color-error)]">warning</span>
              Approaching SLA Breach
            </h3>
            <span class="rounded-full bg-[var(--color-error-container)] px-3 py-1 text-[11px] font-medium text-[var(--color-on-error-container)]">
              {{ nearDeadline().length }} Active
            </span>
          </div>
          <div class="flex-1 overflow-y-auto pr-2">
            @for (item of nearDeadline(); track item.issueId) {
              <div class="group mb-3 flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-4 transition-colors hover:border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)]">
                <div class="flex items-start gap-4">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-container)]">
                    <span class="material-symbols-outlined text-[var(--color-on-surface-variant)]">report</span>
                  </div>
                  <div>
                    <h4 class="text-[16px] font-medium text-[var(--color-on-surface)] transition-colors group-hover:text-[var(--color-primary)]">
                      {{ item.title }}
                    </h4>
                    <p class="text-[14px] text-[var(--color-on-surface-variant)]">
                      {{ item.publicCode }} - {{ item.deadlineType }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <div [class]="item.minutesRemaining < 30 ? 'text-[var(--color-error)]' : 'text-[var(--color-tertiary)]'"
                       class="text-[16px] font-medium">
                    {{ formatTimeRemaining(item.minutesRemaining) }}
                  </div>
                  <p class="text-[14px] text-[var(--color-on-surface-variant)]">Priority: {{ item.priorityName }}</p>
                </div>
              </div>
            } @empty {
              <div class="flex flex-col items-center justify-center py-12 text-center">
                <span class="material-symbols-outlined text-[48px] text-[var(--color-on-surface-variant)]">check_circle</span>
                <p class="mt-4 text-[16px] text-[var(--color-on-surface-variant)]">No SLA breaches in the next 2 hours</p>
              </div>
            }
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="flex flex-col gap-6 md:col-span-4">
          <!-- Global Compliance Rate -->
          <div class="relative flex h-48 flex-col items-center justify-center overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
            <div class="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-fixed-dim)]/20 to-transparent"></div>
            <h3 class="relative z-10 mb-2 text-[18px] font-semibold text-[var(--color-on-surface)]">Monthly Compliance</h3>
            <div class="relative z-10 text-[36px] font-bold" [class.text-[var(--color-primary)]]="(overview()?.resolutionRate ?? 0) >= 80" [class.text-[var(--color-error)]]="(overview()?.resolutionRate ?? 0) < 80">
              {{ overview()?.resolutionRate ?? 0 | number:'1.0-1' }}%
            </div>
            <p class="relative z-10 mt-2 flex items-center gap-1 text-[12px] font-medium text-[var(--color-secondary)]">
              <span class="material-symbols-outlined text-sm">trending_up</span>
              {{ overview()?.resolvedOnTime ?? 0 }} resolved on time
            </p>
          </div>

          <!-- Monthly Stats -->
          <div class="flex flex-col rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
            <h3 class="mb-4 border-b border-[var(--color-outline-variant)] pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]">
              This Month
            </h3>
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between">
                <span class="text-[14px] text-[var(--color-on-surface-variant)]">Total Issues</span>
                <span class="text-[16px] font-semibold text-[var(--color-on-surface)]">{{ overview()?.totalIssuesInMonth ?? 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[14px] text-[var(--color-on-surface-variant)]">Resolved On Time</span>
                <span class="text-[16px] font-semibold text-[var(--color-primary)]">{{ overview()?.resolvedOnTime ?? 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[14px] text-[var(--color-on-surface-variant)]">Breached</span>
                <span class="text-[16px] font-semibold text-[var(--color-error)]">{{ overview()?.breached ?? 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[14px] text-[var(--color-on-surface-variant)]">Avg Response</span>
                <span class="text-[16px] font-semibold text-[var(--color-on-surface)]">{{ overview()?.avgResponseTimeMinutes ?? 0 }}m</span>
              </div>
            </div>
          </div>

          <!-- SLA History -->
          <div class="flex flex-1 flex-col rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)] pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-[var(--color-primary)]">history</span>
              SLA History
            </h3>
            <div class="flex flex-col gap-3">
              @for (item of history(); track item.month) {
                <div class="flex items-center justify-between rounded-lg bg-[var(--color-surface-container-low)] p-3">
                  <span class="text-[14px] text-[var(--color-on-surface)]">{{ item.monthName }}</span>
                  <div class="flex items-center gap-2">
                    <span class="text-[12px] text-[var(--color-on-surface-variant)]">{{ item.totalIssues }} issues</span>
                    <span class="rounded-full px-2 py-0.5 text-[11px] font-medium" [class.bg-[var(--color-primary-container)]]="item.resolutionRate >= 80" [class.text-[var(--color-on-primary-container)]]="item.resolutionRate >= 80" [class.bg-[var(--color-error-container)]]="item.resolutionRate < 80" [class.text-[var(--color-on-error-container)]]="item.resolutionRate < 80">
                      {{ item.resolutionRate | number:'1.0-0' }}%
                    </span>
                  </div>
                </div>
              } @empty {
                <p class="text-center text-[14px] text-[var(--color-on-surface-variant)]">No history data</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `],
})
export class StaffManagerSlaAlertComponent implements OnInit {
  private readonly dmService = inject(DepartmentManagerService)

  overview = signal<SlaOverview | null>(null)
  nearDeadline = signal<SlaNearDeadlineItem[]>([])
  history = signal<SlaHistoryItem[]>([])

  ngOnInit(): void {
    this.loadData()
  }

  loadData(): void {
    this.dmService.getSlaOverview().subscribe({
      next: (data) => this.overview.set(data),
      error: (err) => console.error('Failed to load SLA overview:', err),
    })

    this.dmService.getSlaNearDeadline().subscribe({
      next: (data) => this.nearDeadline.set(data),
      error: (err) => console.error('Failed to load near deadline:', err),
    })

    this.dmService.getSlaHistory(6).subscribe({
      next: (data) => this.history.set(data.items),
      error: (err) => console.error('Failed to load SLA history:', err),
    })
  }

  formatTimeRemaining(minutes: number): string {
    if (minutes <= 0) return 'Overdue'
    if (minutes < 60) return `${minutes}m left`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`
  }
}
