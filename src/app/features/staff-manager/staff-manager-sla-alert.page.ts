import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'

interface BreachItem {
  id: string
  type: string
  typeIcon: string
  title: string
  category: string
  timeRemaining: string
  target: string
  isUrgent: boolean
}

interface AlertItem {
  message: string
  time: string
  type: 'error' | 'warning' | 'info'
}

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
              {{ breaches().length }} Active
            </span>
          </div>
          <div class="flex-1 overflow-y-auto pr-2">
            @for (item of breaches(); track item.id) {
              <div class="group mb-3 flex cursor-pointer items-center justify-between rounded-lg border border-transparent p-4 transition-colors hover:border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-container-low)]">
                <div class="flex items-start gap-4">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-container)]">
                    <span class="material-symbols-outlined text-[var(--color-on-surface-variant)]">{{ item.typeIcon }}</span>
                  </div>
                  <div>
                    <h4 class="text-[16px] font-medium text-[var(--color-on-surface)] transition-colors group-hover:text-[var(--color-primary)]">
                      {{ item.title }}
                    </h4>
                    <p class="text-[14px] text-[var(--color-on-surface-variant)]">
                      {{ item.id }} - {{ item.category }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <div [class]="item.isUrgent ? 'text-[var(--color-error)]' : 'text-[var(--color-tertiary-container)]'"
                       class="text-[16px] font-medium">
                    {{ item.timeRemaining }}
                  </div>
                  <p class="text-[14px] text-[var(--color-on-surface-variant)]">Target: {{ item.target }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="flex flex-col gap-6 md:col-span-4">
          <!-- Global Compliance Rate -->
          <div class="relative flex h-48 flex-col items-center justify-center overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
            <div class="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-fixed-dim)]/20 to-transparent"></div>
            <h3 class="relative z-10 mb-2 text-[18px] font-semibold text-[var(--color-on-surface)]">Global Compliance</h3>
            <div class="relative z-10 text-[36px] font-bold text-[var(--color-primary)]">94.2%</div>
            <p class="relative z-10 mt-2 flex items-center gap-1 text-[12px] font-medium text-[var(--color-secondary)]">
              <span class="material-symbols-outlined text-sm">trending_up</span>
              +1.2% vs last week
            </p>
          </div>

          <!-- Recent Alerts -->
          <div class="flex flex-1 flex-col rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 border-b border-[var(--color-outline-variant)] pb-4 text-[18px] font-semibold text-[var(--color-on-surface)]">
              <span class="material-symbols-outlined text-[var(--color-primary)]">notifications_active</span>
              Recent Alerts
            </h3>
            <div class="flex flex-col gap-4">
              @for (alert of alerts(); track alert.message) {
                <div class="flex gap-3">
                  <span [class]="getAlertDotClass(alert.type)" class="mt-2 h-2 w-2 shrink-0 rounded-full"></span>
                  <div>
                    <p class="text-[14px] text-[var(--color-on-surface)]">{{ alert.message }}</p>
                    <span class="text-[11px] text-[var(--color-on-surface-variant)]">{{ alert.time }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
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
export class StaffManagerSlaAlertComponent implements OnInit {

  breaches = signal<BreachItem[]>([
    {
      id: 'INC-2023-8842',
      type: 'Water Main Break',
      typeIcon: 'water_damage',
      title: 'Water Main Break - Ward 4',
      category: 'Infrastructure',
      timeRemaining: '12m remaining',
      target: '45m',
      isUrgent: true,
    },
    {
      id: 'INC-2023-8845',
      type: 'Power Outage',
      typeIcon: 'electric_bolt',
      title: 'Power Outage - Downtown',
      category: 'Utilities',
      timeRemaining: '28m remaining',
      target: '60m',
      isUrgent: false,
    },
  ])

  alerts = signal<AlertItem[]>([
    {
      message: 'Ward 7 Response time dropped below 90% threshold.',
      time: '10 mins ago',
      type: 'error',
    },
    {
      message: 'High volume warning: Traffic signals category.',
      time: '1 hour ago',
      type: 'warning',
    },
  ])

  ngOnInit(): void {
    // TODO: Load SLA data from API
  }

  getAlertDotClass(type: string): string {
    switch (type) {
      case 'error':
        return 'bg-[var(--color-error)]'
      case 'warning':
        return 'bg-[var(--color-tertiary-container)]'
      default:
        return 'bg-[var(--color-surface-variant)]'
    }
  }
}
