import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, map } from 'rxjs'
import { env } from '../../core/config/env'
import { ApiResponse } from './dashboard.service'

// Department Manager Dashboard Types
export interface DepartmentManagerDashboardStats {
  unassignedCount: number
  processingCount: number
  avgResponseTimeMinutes: number
  slaBreachRisksCount: number
  unassignedTrend: number
  processingTrend: number
}

export interface TeamWorkloadItem {
  userId: string
  fullName: string
  avatarUrl?: string
  assignedCount: number
  resolvedCount: number
}

export interface TeamWorkloadResponse {
  members: TeamWorkloadItem[]
}

// Issue Types
export interface DepartmentManagerIssueSummary {
  issueId: number
  publicCode: string
  title: string
  issueTypeId: number
  issueTypeName: string
  issueTypeCode: string
  priorityId: number
  priorityName: string
  priorityColor: string
  statusId: number
  statusName: string
  reportedAt: string
  slaStatus?: string
  firstResponseDueAt?: string
  resolutionDueAt?: string
  thumbnailUrl?: string
  latitude: number
  longitude: number
  issueStatus: string
  assignedMemberCount: number
}

export interface CurrentAssignmentInfo {
  assignmentId: number
  departmentId: number
  departmentName: string
  assignedAt: string
}

export interface AssignmentMemberInfo {
  memberId: number
  userId: string
  fullName: string
  avatarUrl?: string
  status: string
  assignedAt: string
  acceptedAt?: string
  endedAt?: string
  note?: string
}

export interface IssueUpdateInfo {
  id: number
  createdByName: string
  fromStatusName?: string
  toStatusName: string
  note?: string
  progressPercent?: number
  isSystemGenerated: boolean
  createdAt: string
}

export interface DepartmentManagerIssueDetail {
  issueId: number
  publicCode: string
  title: string
  description: string
  issueTypeName: string
  priorityName: string
  statusName: string
  statusCode?: string
  addressText: string
  latitude: number
  longitude: number
  reportedAt: string
  resolvedAt?: string
  upvoteCount: number
  isPublic: boolean
  imageUrls: string[]
  currentAssignment?: CurrentAssignmentInfo
  assignedMembers: AssignmentMemberInfo[]
  updates: IssueUpdateInfo[]
}

export interface DepartmentManagerIssueListRequest {
  filter?: 'my_assigned' | 'team_assigned' | 'unassigned' | 'all'
  statusIds?: number[]
  priorityIds?: number[]
  issueTypeIds?: number[]
  areaId?: number
  keyword?: string
  pageNumber?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface AssignIssueRequest {
  userId: string
  note?: string
}

export interface DepartmentManagerUpdateIssueStatusRequest {
  statusId: number
  note?: string
  progressPercent?: number
}

// SLA Types
export interface SlaOverview {
  totalIssuesInMonth: number
  resolvedOnTime: number
  breached: number
  resolutionRate: number
  avgResponseTimeMinutes: number
  avgResolutionTimeMinutes: number
}

export interface SlaNearDeadlineItem {
  issueId: number
  publicCode: string
  title: string
  deadlineType: string
  dueAt: string
  minutesRemaining: number
  priorityName: string
  statusName: string
}

export interface SlaHistoryItem {
  year: number
  month: number
  monthName: string
  totalIssues: number
  resolvedOnTime: number
  breached: number
  resolutionRate: number
}

export interface SlaHistoryResponse {
  items: SlaHistoryItem[]
  totalCount: number
}

// Staff Types
export interface StaffMemberResponse {
  userId: string
  fullName: string
  email: string
  avatarUrl?: string
  isActive: boolean
  joinedAt: string
  assignedCount: number
  resolvedCount: number
  pendingCount: number
  resolutionRate: number
  avgResolutionHours: number
  currentWorkload: number
}

export interface StaffAssignmentItem {
  issueId: number
  publicCode: string
  title: string
  status: string
  assignedAt: string
  completedAt?: string
}

export interface StaffDetailResponse extends StaffMemberResponse {
  recentAssignments: StaffAssignmentItem[]
}

@Injectable({ providedIn: 'root' })
export class DepartmentManagerService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = env.apiBaseUrl

  // Dashboard Stats
  getDashboardStats(): Observable<DepartmentManagerDashboardStats> {
    return this.http
      .get<ApiResponse<DepartmentManagerDashboardStats>>(`${this.baseUrl}/department-manager/dashboard/stats`)
      .pipe(map((r) => r.data ?? this.emptyStats()))
  }

  getTeamWorkload(): Observable<TeamWorkloadResponse> {
    return this.http
      .get<ApiResponse<TeamWorkloadResponse>>(`${this.baseUrl}/department-manager/dashboard/team-workload`)
      .pipe(map((r) => r.data ?? { members: [] }))
  }

  getUnassignedIssues(pageNumber = 1, pageSize = 10): Observable<DepartmentManagerIssueSummary[]> {
    const params = new HttpParams()
      .set('pageNumber', String(pageNumber))
      .set('pageSize', String(pageSize))
    return this.http
      .get<ApiResponse<DepartmentManagerIssueSummary[]>>(`${this.baseUrl}/department-manager/dashboard/unassigned-issues`, { params })
      .pipe(map((r) => r.data ?? []))
  }

  // Issues
  getIssues(request: DepartmentManagerIssueListRequest = {}): Observable<PaginatedResponse<DepartmentManagerIssueSummary>> {
    const body = {
      pageNumber: request.pageNumber ?? 1,
      pageSize: request.pageSize ?? 20,
      filter: request.filter,
      statusIds: request.statusIds && request.statusIds.length > 0 ? request.statusIds : undefined,
      priorityIds: request.priorityIds && request.priorityIds.length > 0 ? request.priorityIds : undefined,
      issueTypeIds: request.issueTypeIds && request.issueTypeIds.length > 0 ? request.issueTypeIds : undefined,
      keyword: request.keyword || undefined,
    }

    return this.http
      .post<ApiResponse<PaginatedResponse<DepartmentManagerIssueSummary>>>(`${this.baseUrl}/department-manager/issues/filter`, body)
      .pipe(map((r) => r.data ?? { items: [], totalCount: 0, pageNumber: 1, pageSize: 20, totalPages: 0 }))
  }

  getIssueDetail(issueId: number): Observable<DepartmentManagerIssueDetail> {
    return this.http
      .get<ApiResponse<DepartmentManagerIssueDetail>>(`${this.baseUrl}/department-manager/issues/${issueId}`)
      .pipe(
        map((r) => {
          if (!r.success || !r.data) throw new Error(r.message || 'Failed to load issue')
          return r.data
        })
      )
  }

  assignIssue(issueId: number, request: AssignIssueRequest): Observable<DepartmentManagerIssueDetail> {
    return this.http
      .post<ApiResponse<DepartmentManagerIssueDetail>>(`${this.baseUrl}/department-manager/issues/${issueId}/assign`, request)
      .pipe(
        map((r) => {
          if (!r.success || !r.data) throw new Error(r.message || 'Failed to assign')
          return r.data
        })
      )
  }

  updateIssueStatus(issueId: number, request: DepartmentManagerUpdateIssueStatusRequest): Observable<DepartmentManagerIssueDetail> {
    return this.http
      .put<ApiResponse<DepartmentManagerIssueDetail>>(`${this.baseUrl}/department-manager/issues/${issueId}/status`, request)
      .pipe(
        map((r) => {
          if (!r.success || !r.data) throw new Error(r.message || 'Failed to update status')
          return r.data
        })
      )
  }

  // SLA
  getSlaOverview(): Observable<SlaOverview> {
    return this.http
      .get<ApiResponse<SlaOverview>>(`${this.baseUrl}/department-manager/sla/overview`)
      .pipe(map((r) => r.data ?? this.emptySlaOverview()))
  }

  getSlaNearDeadline(): Observable<SlaNearDeadlineItem[]> {
    return this.http
      .get<ApiResponse<SlaNearDeadlineItem[]>>(`${this.baseUrl}/department-manager/sla/near-deadline`)
      .pipe(map((r) => r.data ?? []))
  }

  getSlaHistory(months = 6): Observable<SlaHistoryResponse> {
    const params = new HttpParams().set('months', String(months))
    return this.http
      .get<ApiResponse<SlaHistoryResponse>>(`${this.baseUrl}/department-manager/sla/history`, { params })
      .pipe(map((r) => r.data ?? { items: [], totalCount: 0 }))
  }

  // Staffs
  getStaffs(): Observable<StaffMemberResponse[]> {
    return this.http
      .get<ApiResponse<StaffMemberResponse[]>>(`${this.baseUrl}/department-manager/staffs`)
      .pipe(map((r) => r.data ?? []))
  }

  getStaffDetail(userId: string): Observable<StaffDetailResponse> {
    return this.http
      .get<ApiResponse<StaffDetailResponse>>(`${this.baseUrl}/department-manager/staffs/${userId}`)
      .pipe(
        map((r) => {
          if (!r.success || !r.data) throw new Error(r.message || 'Failed to load staff')
          return r.data
        })
      )
  }

  // Helpers
  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  }

  reviewReopen(issueId: number, approved: boolean, note?: string): Observable<DepartmentManagerIssueDetail> {
    return this.http
      .post<ApiResponse<DepartmentManagerIssueDetail>>(`${this.baseUrl}/issues/${issueId}/review-reopen`, { approved, note })
      .pipe(map((response) => response.data!))
  }

  getSlaStatusColor(status?: string): string {
    switch (status) {
      case 'BREACHED': return '#F44336'
      case 'RESPONSE_BREACHED': return '#FF5722'
      case 'AT_RISK': return '#FF9800'
      case 'ON_TRACK': return '#4CAF50'
      case 'RESOLVED': return '#2196F3'
      default: return '#9E9E9E'
    }
  }

  private emptyStats(): DepartmentManagerDashboardStats {
    return {
      unassignedCount: 0,
      processingCount: 0,
      avgResponseTimeMinutes: 0,
      slaBreachRisksCount: 0,
      unassignedTrend: 0,
      processingTrend: 0,
    }
  }

  private emptySlaOverview(): SlaOverview {
    return {
      totalIssuesInMonth: 0,
      resolvedOnTime: 0,
      breached: 0,
      resolutionRate: 0,
      avgResponseTimeMinutes: 0,
      avgResolutionTimeMinutes: 0,
    }
  }
}
