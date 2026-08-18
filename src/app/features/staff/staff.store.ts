import { computed, inject, Injectable, signal } from '@angular/core'
import { forkJoin } from 'rxjs'
import { StaffService } from './staff.service'
import {
  StaffDashboardSummary,
  StaffTask,
  StaffActivity,
  StaffIncident,
  StaffPagedResponse,
  StaffIncidentDetail,
  StaffApiFilters,
} from './staff.types'

interface StaffState {
  dashboardSummary: StaffDashboardSummary | null
  myTasks: StaffTask[]
  recentActivities: StaffActivity[]
  incidents: StaffIncident[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
  selectedIncident: StaffIncidentDetail | null
  loading: {
    dashboard: boolean
    incidents: boolean
    incidentDetail: boolean
    claim: boolean
  }
  error: string | null
}

const initialState: StaffState = {
  dashboardSummary: null,
  myTasks: [],
  recentActivities: [],
  incidents: [],
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  },
  selectedIncident: null,
  loading: {
    dashboard: false,
    incidents: false,
    incidentDetail: false,
    claim: false,
  },
  error: null,
}

@Injectable({ providedIn: 'root' })
export class StaffStore {
  private readonly staffService = inject(StaffService)
  private readonly state = signal<StaffState>(initialState)

  // Selectors
  readonly dashboardSummary = computed(() => this.state().dashboardSummary)
  readonly myTasks = computed(() => this.state().myTasks)
  readonly recentActivities = computed(() => this.state().recentActivities)
  readonly incidents = computed(() => this.state().incidents)
  readonly pagination = computed(() => this.state().pagination)
  readonly selectedIncident = computed(() => this.state().selectedIncident)
  readonly loading = computed(() => this.state().loading)
  readonly error = computed(() => this.state().error)

  // Methods
  loadDashboardData() {
    this.state.update((s) => ({ ...s, loading: { ...s.loading, dashboard: true }, error: null }))
    forkJoin({
      summary: this.staffService.getDashboardSummary(),
      tasks: this.staffService.getMyTasks(),
      activities: this.staffService.getMyRecentActivities(),
    }).subscribe({
      next: ({ summary, tasks, activities }) => {
        this.state.update((s) => ({
          ...s,
          dashboardSummary: summary,
          myTasks: tasks,
          recentActivities: activities,
          loading: { ...s.loading, dashboard: false },
        }))
      },
      error: () => {
        this.state.update((s) => ({
          ...s,
          error: 'Failed to load dashboard data.',
          loading: { ...s.loading, dashboard: false },
        }))
      },
    })
  }

  loadIncidents(filters?: StaffApiFilters) {
    this.state.update((s) => ({ ...s, loading: { ...s.loading, incidents: true }, error: null }))
    this.staffService.getStaffIncidents(filters).subscribe({
      next: (response) => {
        this.state.update((s) => ({
          ...s,
          incidents: response.items,
          pagination: {
            page: response.page,
            pageSize: response.pageSize,
            totalItems: response.totalItems,
            totalPages: response.totalPages,
          },
          loading: { ...s.loading, incidents: false },
        }))
      },
      error: () => {
        this.state.update((s) => ({
          ...s,
          error: 'Failed to load incidents.',
          incidents: [],
          loading: { ...s.loading, incidents: false },
        }))
      },
    })
  }

  loadIncidentDetail(id: string) {
    this.state.update((s) => ({ ...s, loading: { ...s.loading, incidentDetail: true }, error: null }))
    this.staffService.getStaffIncident(id).subscribe({
      next: (incident) => {
        this.state.update((s) => ({ ...s, selectedIncident: incident, loading: { ...s.loading, incidentDetail: false } }))
      },
      error: () => {
        this.state.update((s) => ({ ...s, error: 'Failed to load incident detail.', loading: { ...s.loading, incidentDetail: false } }))
      },
    })
  }

  claimIncident(id: string) {
    this.state.update((s) => ({ ...s, loading: { ...s.loading, claim: true }, error: null }))
    this.staffService.claimIncident(id).subscribe({
      next: () => {
        this.state.update((s) => ({ ...s, loading: { ...s.loading, claim: false } }))
        this.loadIncidents() // Refresh list
      },
      error: (err) => {
        this.state.update((s) => ({
          ...s,
          error: err.error?.message || 'Failed to claim incident. It may already be assigned.',
          loading: { ...s.loading, claim: false },
        }))
      },
    })
  }
}
