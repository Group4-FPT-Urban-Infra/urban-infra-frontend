import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AuthStore } from '../../core/auth/auth.store'
import { StaffStore } from './staff.store'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-staff-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[var(--color-surface)] p-4 md:p-8">
      <!-- Page Header -->
      @if (store.error()) {
        <div class="mb-4 rounded-md bg-red-100 p-4 text-red-700">{{ store.error() }}</div>
      }
      <header class="mb-6 flex items-end justify-between">
        <div>
          <h2 class="text-[36px] font-bold text-[var(--color-on-surface)]" style="letter-spacing: -0.02em; line-height: 44px;">
            Good Morning, {{ userName() }}
          </h2>
          <p class="mt-1 text-[14px] text-[var(--color-on-surface-variant)]">
            Here is your daily incident overview for District 4.
          </p>
        </div>
        <div class="hidden items-center gap-4 md:flex">
          <button class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-low)]">
            <span class="material-symbols-outlined text-[16px]">filter_list</span>
            Filter
          </button>
          <button class="flex items-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-low)]">
            <span class="material-symbols-outlined text-[16px]">download</span>
            Export
          </button>
        </div>
      </header>

      <!-- Metrics Bento Grid -->
      @if (store.loading().dashboard) {
        <div class="text-center p-8">Loading dashboard data...</div>
      } @else if (store.dashboardSummary(); as summary) {
      <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <!-- Assigned Incidents -->
        <div class="flex flex-col justify-between rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div class="mb-4 flex items-start justify-between">
            <span class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Assigned Incidents
            </span>
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-fixed)]/20 text-[var(--color-primary)]">
              <span class="material-symbols-outlined text-[20px]">assignment_ind</span>
            </div>
          </div>
          <div>
            <h3 class="text-[28px] font-bold text-[var(--color-on-surface)]">{{ summary.assignedTasks }}</h3>
            <p class="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--color-secondary)]">
              <span class="material-symbols-outlined text-[14px]">arrow_downward</span>
              12% from yesterday
            </p>
          </div>
        </div>

        <!-- High Priority Tasks -->
        <div class="flex flex-col justify-between rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div class="mb-4 flex items-start justify-between">
            <span class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              High Priority Tasks
            </span>
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-error-container)] text-[var(--color-on-error-container)]">
              <span class="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div>
            <h3 class="text-[28px] font-bold text-[var(--color-on-surface)]">{{ summary.highPriorityTasks }}</h3>
            <p class="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--color-error)]">
              <span class="material-symbols-outlined text-[14px]">arrow_upward</span>
              3 new in last hour
            </p>
          </div>
        </div>

        <!-- Avg Resolution Time -->
        <div class="flex flex-col justify-between rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div class="mb-4 flex items-start justify-between">
            <span class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Avg Resolution Time
            </span>
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-tertiary-fixed)]/20 text-[var(--color-tertiary-container)]">
              <span class="material-symbols-outlined text-[20px]">timer</span>
            </div>
          </div>
          <div>
            <h3 class="text-[28px] font-bold text-[var(--color-on-surface)]">{{ summary.avgResolutionTimeHours }}h</h3>
            <p class="mt-1 flex items-center gap-1 text-[11px] font-medium text-[var(--color-secondary)]">
              <span class="material-symbols-outlined text-[14px]">check_circle</span>
              On target (5h SLA)
            </p>
          </div>
        </div>

        <!-- Pending Verifications -->
        <div class="flex flex-col justify-between rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div class="mb-4 flex items-start justify-between">
            <span class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Pending Verifications
            </span>
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]">
              <span class="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
          </div>
          <div>
            <h3 class="text-[28px] font-bold text-[var(--color-on-surface)]">{{ summary.pendingVerifications }}</h3>
            <p class="mt-1 text-[11px] font-medium text-[var(--color-on-surface-variant)]">
              Requires field inspection
            </p>
          </div>
        </div>
      </div>
      }

      <!-- Main Grid Layout -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Left Column: Priority Tasks & Activity -->
        <div class="flex flex-col gap-6 lg:col-span-2">
          <!-- Priority Inbox -->
          <section class="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] shadow-sm">
            <div class="flex items-center justify-between border-b border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-bright)] px-6 py-4">
              <h3 class="text-[18px] font-semibold text-[var(--color-on-surface)]">Priority Tasks</h3>
              <a routerLink="/staff/incidents" class="text-[12px] font-medium text-[var(--color-primary)] hover:underline">
                View All
              </a>
            </div>
            <div class="flex-1 overflow-y-auto">
              @if (store.loading().dashboard) {
                <div class="p-4 text-center text-sm text-[var(--color-on-surface-variant)]">Loading tasks...</div>
              } @else if (store.myTasks().length === 0) {
                <div class="p-4 text-center text-sm text-[var(--color-on-surface-variant)]">No tasks assigned to you.</div>
              } @else {
                @for (task of store.myTasks(); track task.id; let last = $last) {
                  <div class="group cursor-pointer p-4 transition-colors hover:bg-[var(--color-surface-container-low)]" [class.border-b]="!last" [class.border-[var(--color-outline-variant)]/50]="!last">
                    <div class="mb-2 flex items-start justify-between">
                      <div class="flex items-center gap-2">
                        <span class="rounded-full px-2 py-0.5 text-[11px] font-medium" [ngClass]="getPriorityClass(task.priority)">{{ task.priority }}</span>
                        <span class="text-[11px] text-[var(--color-on-surface-variant)]">{{ task.id }}</span>
                      </div>
                      <span class="text-[11px] text-[var(--color-on-surface-variant)]">{{ task.assignedAt | date:'shortTime' }}</span>
                    </div>
                    <h4 class="mb-2 text-[16px] font-semibold text-[var(--color-on-surface)]">
                      {{ task.title }}
                    </h4>
                    <p class="mb-3 line-clamp-1 text-[14px] text-[var(--color-on-surface-variant)]">
                      {{ task.location }}
                    </p>
                    <div class="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button class="rounded bg-[var(--color-primary)] px-3 py-1 text-[11px] font-medium text-white hover:bg-[var(--color-primary)]/90">
                        Update Status
                      </button>
                      <a [routerLink]="['/staff/incidents', task.id.replace('INC-', '')]" class="rounded bg-[var(--color-surface-variant)] px-3 py-1 text-[11px] font-medium text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-dim)]">
                        View Details
                      </a>
                    </div>
                  </div>
                }
              }
            </div>
          </section>
        </div>

        <!-- Right Column: Map Widget & Recent Activity -->
        <div class="flex flex-col gap-6">
          <!-- Map Widget -->
          <section class="relative h-[300px] overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] shadow-sm">
            <div class="absolute inset-0 bg-cover bg-center opacity-60"
              style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAs8MiUe91CwBny2dWxXpk_BecAYbdpuoliWBM30k3glyKH8ZG2QkTTFeQLGfwtJpfnqAQN-yNB1JXQ3gL2AGKOJCLp6kHGbRqk9EL2E85IvKxBgBZPdvD1XncJfAIM9pcqVPq6OWAuHbevi2X7bbK9WsQKeaJ3nd1IpQZ6N8vRHHj_b9JH4LbZt8WETjcHYfF6UsMYwzgGeb6I-sSbHDIgQC2cCL5Zh0B_Wf3ErfS2C-ld2Qa0708');"
            ></div>
            <!-- Map Overlay/Controls -->
            <div class="absolute inset-0 flex flex-col justify-between p-4">
              <div class="flex items-center justify-between">
                <div class="rounded-md bg-white/70 px-2 py-1 text-[11px] font-medium text-[var(--color-on-surface)] shadow-sm backdrop-blur-md">
                  Active Field Units: 14
                </div>
                <button class="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 shadow-sm transition-colors hover:bg-white/90">
                  <span class="material-symbols-outlined text-[18px]">fullscreen</span>
                </button>
              </div>
              <!-- Map Pins -->
              <div class="absolute top-1/3 left-1/4 h-4 w-4 animate-pulse rounded-full border-2 border-white bg-[var(--color-error)] shadow-md"></div>
              <div class="absolute top-1/2 left-2/3 h-4 w-4 rounded-full border-2 border-white bg-[var(--color-tertiary-fixed)] shadow-md"></div>
              <div class="absolute bottom-1/4 left-1/2 h-4 w-4 rounded-full border-2 border-white bg-[var(--color-primary)] shadow-md"></div>
              <!-- Info Box -->
              <div class="flex items-center gap-2 rounded-lg bg-white/70 p-3 shadow-sm backdrop-blur-md">
                <span class="material-symbols-outlined text-[var(--color-primary)]">my_location</span>
                <div>
                  <p class="text-[12px] font-medium text-[var(--color-on-surface)]">District 4 Overview</p>
                  <p class="text-[11px] text-[var(--color-on-surface-variant)]">3 Active Critical Incidents</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Recent Activity Feed -->
          <section class="flex-1 overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container-lowest)] shadow-sm">
            <div class="border-b border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-bright)] px-6 py-4">
              <h3 class="text-[18px] font-semibold text-[var(--color-on-surface)]">Recent Activity</h3>
            </div>
            @if (store.loading().dashboard) {
              <div class="p-4 text-center text-sm text-[var(--color-on-surface-variant)]">Loading activities...</div>
            } @else if (store.recentActivities().length === 0) {
              <div class="p-4 text-center text-sm text-[var(--color-on-surface-variant)]">No recent activity.</div>
            } @else {
              <div class="flex flex-col gap-4 p-4">
                @for (activity of store.recentActivities(); track activity.id; let last = $last) {
                  <div class="flex gap-4">
                    <div class="mt-1">
                      <div class="h-2 w-2 rounded-full bg-[var(--color-secondary-container)] ring-4 ring-[var(--color-secondary-container)]/20"></div>
                      @if (!last) {
                        <div class="mx-auto mt-1 h-full w-px bg-[var(--color-outline-variant)]/50"></div>
                      }
                    </div>
                    <div class="flex-1" [class.border-b]="!last" [class.border-[var(--color-outline-variant)]/30]="!last" [class.pb-4]="!last">
                      <p class="text-[14px] text-[var(--color-on-surface)]">
                        <span class="font-semibold">{{ activity.actorName }}</span> {{ activity.action }} incident
                        <a [routerLink]="['/staff/incidents', activity.issueId.replace('INC-', '')]" class="text-[var(--color-primary)] hover:underline">{{ activity.issueId }}</a>.
                      </p>
                      <p class="mt-1 text-[11px] text-[var(--color-on-surface-variant)]">{{ activity.createdAt | date:'short' }}</p>
                    </div>
                  </div>
                }
              </div>
          }
          </section>
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
export class StaffHomeComponent implements OnInit {
  protected readonly authStore = inject(AuthStore)
  protected readonly store = inject(StaffStore)

  ngOnInit(): void {
    this.store.loadDashboardData()
  }

  userName(): string {
    const user = this.authStore.user()
    return user?.fullName?.split(' ')[0] || 'Alex'
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Critical':
        return 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
      case 'High':
        return 'bg-[var(--color-tertiary-fixed)] text-[var(--color-on-tertiary-fixed)]'
      case 'Medium':
        return 'bg-[var(--color-primary-fixed)] text-[var(--color-on-primary-fixed)]'
      case 'Low':
        return 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]'
      default:
        return 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]'
    }
  }
}
