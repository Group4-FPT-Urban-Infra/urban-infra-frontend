import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AuthStore } from '../../core/auth/auth.store'

@Component({
  selector: 'app-staff-manager-home',
  standalone: true,
  imports: [CommonModule],
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
            <h3 class="text-[36px] font-bold text-[var(--color-on-surface)]">24</h3>
            <p class="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--color-error)]">
              <span class="material-symbols-outlined text-[14px]">trending_up</span>
              +12% vs yesterday
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
            <h3 class="text-[36px] font-bold text-[var(--color-on-surface)]">156</h3>
            <p class="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--color-secondary)]">
              <span class="material-symbols-outlined text-[14px]">trending_up</span>
              Optimal capacity
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
            <h3 class="text-[36px] font-bold text-[var(--color-on-surface)]">42<span class="text-[18px] text-[var(--color-on-surface-variant)] ml-1">m</span></h3>
            <p class="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--color-secondary)]">
              <span class="material-symbols-outlined text-[14px]">trending_down</span>
              -5m vs average
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
            <h3 class="text-[36px] font-bold text-[var(--color-error)]">7</h3>
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
            <button class="flex items-center gap-1 text-[12px] font-medium text-[var(--color-primary)] hover:underline">
              View All
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
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
                <tr class="border-b border-[var(--color-outline-variant)]/20 transition-colors hover:bg-[var(--color-surface-container-lowest)]">
                  <td class="p-4 font-medium">#INC-4920</td>
                  <td class="p-4">Water Main Break</td>
                  <td class="p-4">
                    <span class="inline-flex items-center rounded-full bg-[var(--color-error-container)]/30 px-2 py-1 text-[11px] font-medium text-[var(--color-error)]">
                      High
                    </span>
                  </td>
                  <td class="p-4 text-[var(--color-on-surface-variant)]">10 mins ago</td>
                  <td class="p-4">
                    <button class="text-[12px] font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-container)]">
                      Assign
                    </button>
                  </td>
                </tr>
                <tr class="border-b border-[var(--color-outline-variant)]/20 transition-colors hover:bg-[var(--color-surface-container-lowest)]">
                  <td class="p-4 font-medium">#INC-4919</td>
                  <td class="p-4">Traffic Signal Failure</td>
                  <td class="p-4">
                    <span class="inline-flex items-center rounded-full bg-[var(--color-error-container)]/30 px-2 py-1 text-[11px] font-medium text-[var(--color-error)]">
                      High
                    </span>
                  </td>
                  <td class="p-4 text-[var(--color-on-surface-variant)]">25 mins ago</td>
                  <td class="p-4">
                    <button class="text-[12px] font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-container)]">
                      Assign
                    </button>
                  </td>
                </tr>
                <tr class="border-b border-[var(--color-outline-variant)]/20 transition-colors hover:bg-[var(--color-surface-container-lowest)]">
                  <td class="p-4 font-medium">#INC-4915</td>
                  <td class="p-4">Pothole Repair</td>
                  <td class="p-4">
                    <span class="inline-flex items-center rounded-full bg-[var(--color-tertiary-container)]/20 px-2 py-1 text-[11px] font-medium text-[var(--color-tertiary)]">
                      Medium
                    </span>
                  </td>
                  <td class="p-4 text-[var(--color-on-surface-variant)]">1 hour ago</td>
                  <td class="p-4">
                    <button class="text-[12px] font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-container)]">
                      Assign
                    </button>
                  </td>
                </tr>
                <tr class="transition-colors hover:bg-[var(--color-surface-container-lowest)]">
                  <td class="p-4 font-medium">#INC-4912</td>
                  <td class="p-4">Vandalism Report</td>
                  <td class="p-4">
                    <span class="inline-flex items-center rounded-full bg-[var(--color-surface-variant)] px-2 py-1 text-[11px] font-medium text-[var(--color-on-surface-variant)]">
                      Low
                    </span>
                  </td>
                  <td class="p-4 text-[var(--color-on-surface-variant)]">3 hours ago</td>
                  <td class="p-4">
                    <button class="text-[12px] font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-container)]">
                      Assign
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Team Workload Summary -->
        <div class="flex flex-col gap-6">
          <div class="flex flex-1 flex-col rounded-xl border border-[var(--color-surface-container-highest)] bg-white p-6 shadow-sm">
            <h3 class="mb-6 text-[18px] font-semibold text-[var(--color-on-surface)]">Team Workload</h3>
            <div class="flex flex-col gap-4">
              <!-- Alpha Squad -->
              <div class="flex flex-col gap-1">
                <div class="flex items-end justify-between text-[12px] font-medium">
                  <span class="text-[var(--color-on-surface)]">Alpha Squad (North)</span>
                  <span class="font-medium text-[var(--color-error)]">95% Capacity</span>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-container-high)]">
                  <div class="h-2 rounded-full bg-[var(--color-error)]" style="width: 95%"></div>
                </div>
              </div>
              <!-- Beta Squad -->
              <div class="flex flex-col gap-1">
                <div class="flex items-end justify-between text-[12px] font-medium">
                  <span class="text-[var(--color-on-surface)]">Beta Squad (East)</span>
                  <span class="font-medium text-[var(--color-tertiary-container)]">75% Capacity</span>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-container-high)]">
                  <div class="h-2 rounded-full bg-[var(--color-tertiary-container)]" style="width: 75%"></div>
                </div>
              </div>
              <!-- Gamma Squad -->
              <div class="flex flex-col gap-1">
                <div class="flex items-end justify-between text-[12px] font-medium">
                  <span class="text-[var(--color-on-surface)]">Gamma Squad (South)</span>
                  <span class="font-medium text-[var(--color-secondary)]">40% Capacity</span>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-container-high)]">
                  <div class="h-2 rounded-full bg-[var(--color-secondary)]" style="width: 40%"></div>
                </div>
              </div>
              <!-- Delta Squad -->
              <div class="flex flex-col gap-1">
                <div class="flex items-end justify-between text-[12px] font-medium">
                  <span class="text-[var(--color-on-surface)]">Delta Squad (West)</span>
                  <span class="font-medium text-[var(--color-secondary)]">55% Capacity</span>
                </div>
                <div class="h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-container-high)]">
                  <div class="h-2 rounded-full bg-[var(--color-secondary)]" style="width: 55%"></div>
                </div>
              </div>
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
export class StaffManagerHomeComponent implements OnInit {
  protected readonly authStore = inject(AuthStore)

  ngOnInit(): void {
    // TODO: Load staff manager-specific data
  }
}
