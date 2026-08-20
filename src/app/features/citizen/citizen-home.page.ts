import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterLink } from '@angular/router'
import { AuthStore } from '../../core/auth/auth.store'
import { DashboardService } from '../../core/services/dashboard.service'
import type { ReportSummaryResponse, ReportUpdateResponse, IssueTimelineItemResponse } from '../../core/services/dashboard.service'
import { forkJoin } from 'rxjs'

interface NeighborhoodUpdate extends IssueTimelineItemResponse {
  issueTitle: string
  issueId: number
}

@Component({
  selector: 'app-citizen-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[var(--color-surface)] p-4 md:p-8">
      <!-- Page Header -->
      <header class="mb-6 flex items-end justify-between">
        <div>
          <h2 class="text-[36px] font-bold text-[var(--color-on-surface)]" style="letter-spacing: -0.02em; line-height: 44px;">
            Welcome back, {{ userName() }}.
          </h2>
          <p class="mt-1 text-[14px] text-[var(--color-on-surface-variant)]">
            Here's the latest on your community contributions.
          </p>
        </div>
        <!-- Desktop Top Actions -->
        <div class="hidden items-center gap-4 text-[var(--color-on-surface-variant)] md:flex">
          @if (authStore.isAuthenticated()) {
            <div class="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-primary-fixed)] text-xs font-bold text-[var(--color-primary)]">
              {{ getUserInitials() }}
            </div>
          }
        </div>
      </header>

      <!-- Bento Grid Layout -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-12">
        <!-- Stats Row -->
        <div class="grid grid-cols-1 gap-4 md:col-span-12 md:grid-cols-3">
          <!-- Stat Card 1: Total Reports -->
          <div
            class="flex flex-col justify-between rounded-xl border border-[var(--color-surface-container)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm"
          >
            <div class="mb-4 flex items-start justify-between">
              <span
                class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]"
              >
                Total Reports
              </span>
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-fixed)] text-[var(--color-on-primary-fixed)]"
              >
                <span class="material-symbols-outlined text-[18px]">assignment</span>
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-[36px] font-bold text-[var(--color-on-surface)]">{{ myStats().totalReports }}</span>
            </div>
          </div>

          <!-- Stat Card 2: Resolved -->
          <div
            class="flex flex-col justify-between rounded-xl border border-[var(--color-surface-container)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm"
          >
            <div class="mb-4 flex items-start justify-between">
              <span
                class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]"
              >
                Resolved
              </span>
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
              >
                <span class="material-symbols-outlined text-[18px]">check_circle</span>
              </div>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-[36px] font-bold text-[var(--color-on-surface)]">{{ myStats().resolved }}</span>
              <span
                class="rounded-full bg-[var(--color-secondary-fixed)]/30 px-2 py-0.5 text-[11px] font-medium text-[var(--color-secondary)]"
              >
                +2 this week
              </span>
            </div>
          </div>

          <!-- Stat Card 3: Helpfulness Score -->
          <div
            class="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[var(--color-surface-container)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm"
          >
            <!-- Subtle background accent -->
            <div
              class="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-[var(--color-tertiary-fixed)] opacity-20 blur-xl transition-transform duration-500 group-hover:scale-110"
            ></div>
            <div class="mb-4 relative z-10 flex items-start justify-between">
              <span
                class="text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]"
              >
                Helpfulness Score
              </span>
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-tertiary-fixed)] text-[var(--color-on-tertiary-fixed)]"
              >
                <span class="material-symbols-outlined text-[18px]">star</span>
              </div>
            </div>
            <div class="relative z-10 flex items-baseline gap-2">
              <span class="text-[36px] font-bold text-[var(--color-on-surface)]">{{ myStats().helpfulnessScore }}</span>
              <span class="text-[12px] text-[var(--color-on-surface-variant)]">/ 100</span>
            </div>
            <!-- Progress bar -->
            <div class="relative z-10 mt-4 h-1.5 w-full rounded-full bg-[var(--color-surface-container)]">
              <div
                class="h-1.5 rounded-full bg-[var(--color-tertiary-container)]"
                [style.width.%]="myStats().helpfulnessScore"
              ></div>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="flex flex-col gap-6 md:col-span-8">
          <!-- My Reports Section -->
          <section
            class="flex flex-1 flex-col overflow-hidden rounded-xl border border-[var(--color-surface-container)] bg-[var(--color-surface-container-lowest)] shadow-sm"
          >
            <div
              class="flex items-center justify-between border-b border-[var(--color-surface-container)] bg-[var(--color-surface-container-low)] px-6 py-4"
            >
              <h3 class="text-[20px] font-semibold text-[var(--color-on-surface)]" style="line-height: 28px;">
                My Active Reports
              </h3>
              <a
                routerLink="/citizen/reports"
                class="text-[12px] font-medium text-[var(--color-primary)] hover:underline"
              >
                View All
              </a>
            </div>
            <div class="divide-y divide-[var(--color-surface-container)]">
              @if (isLoadingMyReports()) {
                <div class="flex items-center justify-center p-8">
                  <span class="material-symbols-outlined animate-spin text-3xl text-[var(--color-primary)]">
                    progress_activity
                  </span>
                </div>
              } @else if (myReports().length === 0) {
                <div class="flex flex-col items-center justify-center p-8 text-[var(--color-on-surface-variant)]">
                  <span class="material-symbols-outlined text-3xl">inbox</span>
                  <p class="mt-2 text-sm">No reports yet</p>
                  @if (authStore.isAuthenticated()) {
                    <a
                      routerLink="/incident-reporting"
                      class="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-on-primary)]"
                    >
                      Create First Report
                    </a>
                  }
                </div>
              } @else {
                @for (report of myReports().slice(0, 3); track report.id) {
                  <div
                    class="flex cursor-pointer flex-col items-start gap-4 p-4 transition-colors hover:bg-[var(--color-surface-container-low)] sm:flex-row sm:items-center"
                    (click)="viewReportDetail(report.id)"
                  >
                    <!-- Thumbnail -->
                    @if (getImageUrl(report.thumbnailUrl)) {
                      <img
                        [src]="getImageUrl(report.thumbnailUrl)"
                        [alt]="report.title"
                        class="h-16 w-24 shrink-0 rounded-lg object-cover sm:h-16 sm:w-24"
                      />
                    } @else {
                      <div
                        class="flex h-24 w-full shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-variant)] sm:h-16 sm:w-24"
                      >
                        <span class="material-symbols-outlined text-[32px] text-[var(--color-outline)]"
                          >report</span
                        >
                      </div>
                    }

                    <!-- Info -->
                    <div class="min-w-0 flex-1">
                      <div class="mb-1 flex items-center gap-2">
                        <span class="rounded-full bg-[var(--color-primary-fixed)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-primary)]">
                          {{ report.resolvedIssueCount }}/{{ report.issueCount }} issues resolved
                        </span>
                        <span class="text-[11px] text-[var(--color-on-surface-variant)]"
                          >• #{{ report.publicCode }}</span
                        >
                      </div>
                      <h4 class="truncate text-[18px] font-semibold text-[var(--color-on-surface)]" style="line-height: 24px;">
                        {{ report.title }}
                      </h4>
                      <p class="mt-1 truncate text-[14px] text-[var(--color-on-surface-variant)]">
                        {{ issueTypeNames(report) }} • {{ formatTimeAgo(report.reportedAt) }}
                      </p>
                    </div>

                    <button
                      class="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-outline-variant)] text-[var(--color-outline)] transition-colors hover:border-[var(--color-error)] hover:bg-[var(--color-surface-variant)]/20 sm:flex"
                    >
                      <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                }
              }
            </div>
          </section>
        </div>

        <!-- Right Column -->
        <div class="flex flex-col gap-6 md:col-span-4">
          <!-- Notification Center Widget -->
          <section
            class="rounded-xl border border-[var(--color-surface-container)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm"
          >
            <div class="mb-4 flex items-center justify-between">
              <h3 class="flex items-center gap-2 text-[18px] font-semibold text-[var(--color-on-surface)]">
                <span class="material-symbols-outlined text-[var(--color-primary)]">notifications_active</span>
                Updates
              </h3>
            </div>
            <div class="flex flex-col gap-4">
              @for (update of recentUpdates(); track update.id) {
                <div class="relative flex items-start gap-3 border-l-2 border-[var(--color-primary-fixed)] pl-4">
                  <div class="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[var(--color-primary-container)]"></div>
                  <div>
                    <p class="text-[12px] font-medium text-[var(--color-on-surface)]">
                      <span class="font-bold">#{{ update.reportPublicCode }}</span> — {{ update.note || update.toStatus?.name || update.updateType }}
                    </p>
                    <span class="text-[11px] text-[var(--color-on-surface-variant)]">{{ formatTimeAgo(update.createdAt) }}</span>
                  </div>
                </div>
              } @empty {
                <p class="text-sm text-[var(--color-on-surface-variant)]">Chưa có cập nhật xử lý.</p>
              }
            </div>
          </section>

          <!-- Recent Activity Feed -->
          <section
            class="flex flex-1 rounded-xl border border-[var(--color-surface-container)] bg-[var(--color-surface-container-lowest)] p-6 shadow-sm"
          >
            <h3 class="mb-4 text-[18px] font-semibold text-[var(--color-on-surface)]">Neighborhood Activity</h3>
            <div class="relative">
              <!-- Activity Line -->
              <div class="absolute left-4 top-2 bottom-2 w-px bg-[var(--color-surface-container)]"></div>
              <div class="flex flex-col gap-6">
                @for (activity of neighborhoodUpdates(); track activity.issueId + '-' + activity.id) {
                  <a [routerLink]="['/citizen/reports', activity.issueId]" class="relative flex items-start gap-4">
                    <div class="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-surface-container-lowest)] bg-[var(--color-secondary-fixed)]/20">
                      <span class="material-symbols-outlined text-[14px] text-[var(--color-secondary)]">history</span>
                    </div>
                    <div class="pt-1">
                      <p class="text-[14px] text-[var(--color-on-surface-variant)]"><span class="font-medium text-[var(--color-on-surface)]">{{ activity.issueTitle }}</span> — {{ activity.note || activity.toStatus?.name || activity.updateType }}</p>
                      <span class="mt-1 block text-[11px] text-[var(--color-outline)]">{{ formatTimeAgo(activity.createdAt) }}</span>
                    </div>
                  </a>
                } @empty {
                  <p class="pl-10 text-sm text-[var(--color-on-surface-variant)]">Chưa có cập nhật sự cố lân cận.</p>
                }
              </div>
            </div>
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
export class CitizenHomeComponent implements OnInit {
  protected readonly authStore = inject(AuthStore)
  private readonly dashboardService = inject(DashboardService)
  private readonly router = inject(Router)

  myStats = signal({ totalReports: 0, resolved: 0, helpfulnessScore: 0 })
  myReports = signal<ReportSummaryResponse[]>([])
  recentUpdates = signal<ReportUpdateResponse[]>([])
  neighborhoodUpdates = signal<NeighborhoodUpdate[]>([])
  isLoadingMyReports = signal(false)

  ngOnInit(): void {
    this.loadMyData()
    this.loadNeighborhoodActivity()
  }

  userName(): string {
    const user = this.authStore.user()
    return user?.fullName?.split(' ')[0] || 'Citizen'
  }

  getUserInitials(): string {
    const name = this.authStore.user()?.fullName || 'User'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(-2)
      .join('')
      .toUpperCase()
  }

  private loadMyData(): void {
    if (this.authStore.isAuthenticated()) {
      this.isLoadingMyReports.set(true)
      this.dashboardService.getMyReports().subscribe({
        next: (reports) => {
          this.myReports.set(reports)
          const resolved = reports.filter((item) => item.issueCount > 0 && item.resolvedIssueCount === item.issueCount).length
          const totalIssues = reports.reduce((sum, item) => sum + item.issueCount, 0)
          const totalResolved = reports.reduce((sum, item) => sum + item.resolvedIssueCount, 0)
          const helpfulnessScore = totalIssues > 0 ? Math.round((totalResolved / totalIssues) * 100) : 0
          this.myStats.set({ totalReports: reports.length, resolved, helpfulnessScore })
          this.dashboardService.getMyReportUpdates(5).subscribe({
            next: (updates) => this.recentUpdates.set(updates), error: () => this.recentUpdates.set([]),
          })
          this.isLoadingMyReports.set(false)
        },
        error: () => {
          this.myReports.set([])
          this.isLoadingMyReports.set(false)
        },
      })
    }
  }

  formatTimeAgo(date: string | Date): string {
    return this.dashboardService.formatTimeAgo(date)
  }

  getImageUrl(relativePath: string | null | undefined): string | null {
    return this.dashboardService.getImageUrl(relativePath)
  }

  viewReportDetail(id: number): void {
    void this.router.navigate(['/citizen/my-reports', id])
  }

  issueTypeNames(report: ReportSummaryResponse): string {
    return report.issueTypes.map((type) => type.name).join(', ')
  }

  private loadNeighborhoodActivity(): void {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      this.dashboardService.getNearbyIssues(coords.latitude, coords.longitude, 20000, { limit: 10 }).subscribe({
        next: (issues) => {
          if (!issues.length) return
          forkJoin(issues.map((issue) => this.dashboardService.getTimeline(issue.id))).subscribe({
            next: (groups) => this.neighborhoodUpdates.set(groups.flatMap((updates, index) =>
              updates.map((update) => ({ ...update, issueId: issues[index].id, issueTitle: issues[index].title })))
              .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5)),
            error: () => this.neighborhoodUpdates.set([]),
          })
        },
      })
    })
  }
}
