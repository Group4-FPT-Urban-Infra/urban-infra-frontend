import { Injectable, inject, signal, computed } from '@angular/core'
import {
  DashboardService,
  DashboardStatsResponse,
  IssueSummaryResponse,
  NearbyIssueResponse,
} from '../../core/services/dashboard.service'

@Injectable({ providedIn: 'root' })
export class HomeStore {
  private readonly dashboardService = inject(DashboardService)

  // State signals
  readonly stats = signal<DashboardStatsResponse | null>(null)
  readonly latestIssues = signal<IssueSummaryResponse[]>([])
  readonly nearbyIssues = signal<NearbyIssueResponse[]>([])
  readonly currentLocation = signal<{ lat: number; lng: number } | null>(null)
  readonly selectedIssue = signal<NearbyIssueResponse | null>(null)
  readonly isLoadingStats = signal(false)
  readonly isLoadingLatest = signal(false)
  readonly isLoadingNearby = signal(false)
  readonly error = signal<string | null>(null)

  // Computed: issues at the same location as selected issue
  readonly issuesAtSelectedLocation = computed(() => {
    const selected = this.selectedIssue()
    if (!selected) return []
    const issues = this.nearbyIssues()
    return issues.filter(
      (i) =>
        i.latitude.toFixed(5) === selected.latitude.toFixed(5) &&
        i.longitude.toFixed(5) === selected.longitude.toFixed(5)
    )
  })

  // Computed values
  readonly activeIssues = computed(() => this.stats()?.activeIssuesCount ?? 0)
  readonly resolvedThisWeek = computed(() => this.stats()?.resolvedThisWeekCount ?? 0)
  readonly citizenCount = computed(() => this.stats()?.citizenUsersCount ?? 0)

  readonly formattedActiveIssues = computed(() =>
    this.dashboardService.formatNumber(this.activeIssues())
  )
  readonly formattedResolved = computed(() =>
    this.dashboardService.formatNumber(this.resolvedThisWeek())
  )
  readonly formattedCitizens = computed(() => {
    const count = this.citizenCount()
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count)
  })

  loadAll(): void {
    this.loadStats()
    this.loadLatestIssues()
  }

  loadStats(): void {
    this.isLoadingStats.set(true)
    this.error.set(null)

    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats.set(stats)
        this.isLoadingStats.set(false)
      },
      error: (err) => {
        console.error('Failed to load stats:', err)
        this.error.set('Failed to load statistics')
        this.isLoadingStats.set(false)
      },
    })
  }

  loadLatestIssues(): void {
    this.isLoadingLatest.set(true)

    this.dashboardService.getLatestIssues(10).subscribe({
      next: (issues) => {
        this.latestIssues.set(issues)
        this.isLoadingLatest.set(false)
      },
      error: (err) => {
        console.error('Failed to load latest issues:', err)
        this.isLoadingLatest.set(false)
      },
    })
  }

  loadNearbyIssues(lat: number, lng: number, radiusMeters = 20000): void {
    this.currentLocation.set({ lat, lng })
    this.isLoadingNearby.set(true)

    this.dashboardService.getNearbyIssues(lat, lng, radiusMeters).subscribe({
      next: (issues) => {
        this.nearbyIssues.set(issues)
        this.isLoadingNearby.set(false)
      },
      error: (err) => {
        console.error('Failed to load nearby issues:', err)
        this.isLoadingNearby.set(false)
      },
    })
  }

  selectIssue(issue: NearbyIssueResponse): void {
    this.selectedIssue.set(issue)
  }

  closeModal(): void {
    this.selectedIssue.set(null)
  }

  formatTimeAgo(date: string): string {
    return this.dashboardService.formatTimeAgo(date)
  }

  getImageUrl(relativePath: string | null | undefined): string | null {
    return this.dashboardService.getImageUrl(relativePath)
  }
}
