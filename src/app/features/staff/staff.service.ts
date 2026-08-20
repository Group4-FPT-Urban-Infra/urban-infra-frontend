import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Observable, map } from 'rxjs'
import { env } from '../../core/config/env'
import { formatTimeAgo, parseUtcDate, formatLocalDate, formatLocalDateTime, getSlaCountdownInfo } from '../../core/utils/date.utils'

export interface StaffDashboardSummaryResponse {
  departmentId: number
  departmentName: string
  totalOpenIssues: number
  newIssues: number
  inProgressIssues: number
  recentlyResolvedIssues: number
  slaBreachedOpenIssues: number
}

export interface LookupItemResponse {
  id: number
  code: string
  name: string
}

export interface StaffTaskResponse {
  issueId: number
  publicCode: string
  title: string
  status: LookupItemResponse
  priority: LookupItemResponse
  area: LookupItemResponse
  addressText?: string
  reportedAt: string
  slaResolutionDueAt?: string
  isSlaBreached: boolean
}

export interface StaffActivityResponse {
  activityId: number
  activityType: string
  activityTimestamp: string
  issueId: number
  issuePublicCode: string
  issueTitle: string
  description: string
  actorName?: string
}

export interface StaffMapIssueResponse {
  issueId: number
  publicCode: string
  title: string
  latitude: number
  longitude: number
  status: LookupItemResponse
  priority: LookupItemResponse
  issueType: LookupItemResponse
  assignedDepartment?: LookupItemResponse
  isSlaBreached: boolean
}

export interface StaffIncidentResponse {
  issueId: number
  publicCode: string
  title: string
  status: LookupItemResponse
  priority: LookupItemResponse
  issueType: LookupItemResponse
  area: LookupItemResponse
  reportedAt: string
  assignedDepartment?: LookupItemResponse
  assignmentStatus?: string
  isSlaBreached: boolean
}

export interface ReporterInfoResponse {
  displayName: string
  phoneNumber?: string
  email?: string
}

export interface AssignmentInfoResponse {
  department: LookupItemResponse
  assigneeName?: string
  assignmentStatus?: string
}

export interface IssueAttachmentResponse {
  id: number
  kind: string
  fileUrl: string
  thumbnailUrl?: string
  mimeType: string
  fileSizeBytes: number
  widthPx?: number
  heightPx?: number
  createdAt: string
}

export interface IssueTimelineItemResponse {
  id: number
  updateType: string
  fromStatus?: LookupItemResponse
  toStatus?: LookupItemResponse
  progressPercent?: number
  note?: string
  isSystemGenerated: boolean
  createdAt: string
  attachments: IssueAttachmentResponse[]
}

export interface StaffIncidentDetailResponse {
  issueId: number
  reportId: number
  publicCode: string
  title: string
  description: string
  address?: string
  latitude: number
  longitude: number
  status: LookupItemResponse
  priority: LookupItemResponse
  issueType: LookupItemResponse
  area: LookupItemResponse
  reportedAt: string
  isSlaBreached: boolean
  reporter: ReporterInfoResponse
  currentMember?: CurrentMemberInfo
  assignment?: AssignmentInfoResponse
  reporterImages: IssueAttachmentResponse[]
  staffImages: IssueAttachmentResponse[]
  timeline: IssueTimelineItemResponse[]
}

export interface CurrentMemberInfo {
  memberId: number
  status: string
}

export interface PagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = env.apiBaseUrl
  private readonly serverUrl = env.apiBaseUrl.replace(/\/api$/, '')

  private toAbsoluteUrl(relativePath: string | undefined | null): string | undefined {
    if (!relativePath) return undefined
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) return relativePath
    return this.serverUrl + relativePath
  }

  getDashboardSummary(): Observable<StaffDashboardSummaryResponse> {
    return this.http
      .get<any>(`${this.baseUrl}/staff/dashboard/summary`)
      .pipe(
        map((response) => {
          if (response?.data) {
            return response.data
          }
          return response
        })
      )
  }

  getMyTasks(): Observable<StaffTaskResponse[]> {
    return this.http
      .get<any>(`${this.baseUrl}/staff/tasks/my`)
      .pipe(
        map((response) => {
          if (response?.data) {
            return response.data
          }
          return response || []
        })
      )
  }

  getRecentActivities(): Observable<StaffActivityResponse[]> {
    return this.http
      .get<any>(`${this.baseUrl}/staff/activities/recent`)
      .pipe(
        map((response) => {
          if (response?.data) {
            return response.data
          }
          return response || []
        })
      )
  }

  getMapIssues(filters?: {
    scope?: 'my' | 'department' | 'all'
    statusCodes?: string[]
    priorityIds?: number[]
    issueTypeIds?: number[]
    keyword?: string
    radiusMeters?: number
    latitude?: number
    longitude?: number
  }): Observable<StaffMapIssueResponse[]> {
    let params = new HttpParams()
    if (filters?.scope) {
      params = params.set('scope', filters.scope)
    }
    if (filters?.statusCodes?.length) {
      filters.statusCodes.forEach(code => {
        params = params.append('statusCodes', code)
      })
    }
    if (filters?.priorityIds?.length) {
      filters.priorityIds.forEach(id => {
        params = params.append('priorityIds', String(id))
      })
    }
    if (filters?.issueTypeIds?.length) {
      filters.issueTypeIds.forEach(id => {
        params = params.append('issueTypeIds', String(id))
      })
    }
    if (filters?.keyword) {
      params = params.set('keyword', filters.keyword)
    }
    if (filters?.radiusMeters) {
      params = params.set('radiusMeters', String(filters.radiusMeters))
    }
    if (filters?.latitude) {
      params = params.set('latitude', String(filters.latitude))
    }
    if (filters?.longitude) {
      params = params.set('longitude', String(filters.longitude))
    }

    return this.http
      .get<any>(`${this.baseUrl}/staff/issues/map`, { params })
      .pipe(
        map((response) => {
          if (response?.data) {
            return response.data
          }
          return response || []
        })
      )
  }

  formatTimeAgo(date: Date | string): string {
    return formatTimeAgo(date)
  }

  formatDate(date: Date | string | null | undefined): string {
    return formatLocalDate(date)
  }

  formatDateTime(date: Date | string | null | undefined): string {
    return formatLocalDateTime(date)
  }

  getPriorityClass(priorityCode: string): string {
    const code = priorityCode?.toUpperCase() || ''
    if (code === 'CRITICAL' || code === 'HIGH') {
      return 'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
    }
    if (code === 'MEDIUM') {
      return 'bg-[var(--color-primary-fixed)] text-[var(--color-on-primary-fixed)]'
    }
    return 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]'
  }

  getActivityDotColor(activityType: string): string {
    const type = activityType?.toUpperCase() || ''
    if (type === 'STATUS_CHANGE' || type === 'RESOLVED') {
      return 'bg-[var(--color-secondary-container)]'
    }
    if (type === 'ASSIGNMENT') {
      return 'bg-[var(--color-primary-container)]'
    }
    return 'bg-[var(--color-surface-variant)]'
  }

  getIncidents(filters?: {
    scope?: 'my' | 'department' | 'all'
    statusCodes?: string[]
    priorityIds?: number[]
    issueTypeIds?: number[]
    keyword?: string
    page?: number
    pageSize?: number
  }): Observable<any> {
    let params = new HttpParams()
    if (filters?.page) {
      params = params.set('page', String(filters.page))
    }
    if (filters?.pageSize) {
      params = params.set('pageSize', String(filters.pageSize))
    }
    if (filters?.scope) {
      params = params.set('scope', filters.scope)
    }
    if (filters?.statusCodes?.length) {
      filters.statusCodes.forEach(code => {
        params = params.append('statusCodes', code)
      })
    }
    if (filters?.priorityIds?.length) {
      filters.priorityIds.forEach(id => {
        params = params.append('priorityIds', String(id))
      })
    }
    if (filters?.issueTypeIds?.length) {
      filters.issueTypeIds.forEach(id => {
        params = params.append('issueTypeIds', String(id))
      })
    }
    if (filters?.keyword) {
      params = params.set('keyword', filters.keyword)
    }

    return this.http
      .get<any>(`${this.baseUrl}/staff/incidents`, { params })
      .pipe(
        map((response) => {
          if (response?.data) {
            return response.data
          }
          return response
        })
      )
  }

  getIncidentDetail(issueId: number): Observable<StaffIncidentDetailResponse | null> {
    return this.http
      .get<any>(`${this.baseUrl}/staff/incidents/${issueId}`)
      .pipe(
        map((response) => {
          if (response?.data) {
            return this.mapIncidentDetailUrls(response.data)
          }
          return response || null
        })
      )
  }

  uploadEvidence(
    issueId: number,
    formData: FormData
  ): Observable<StaffIncidentDetailResponse | null> {
    return this.http
      .post<any>(`${this.baseUrl}/staff/incidents/${issueId}/evidence`, formData)
      .pipe(
        map((response) => {
          if (response?.data) {
            return this.mapIncidentDetailUrls(response.data)
          }
          return response || null
        })
      )
  }

  private mapIncidentDetailUrls(data: StaffIncidentDetailResponse): StaffIncidentDetailResponse {
    const transform = (a: any) => ({
      ...a,
      fileUrl: this.toAbsoluteUrl(a.fileUrl),
      thumbnailUrl: this.toAbsoluteUrl(a.thumbnailUrl),
    })
    return {
      ...data,
      reporterImages: data.reporterImages.map(transform),
      staffImages: data.staffImages.map(transform),
      timeline: data.timeline.map(t => ({
        ...t,
        attachments: t.attachments.map(transform),
      })),
    }
  }

  private callAction<T>(method: 'post', url: string, body?: any): Observable<T | null> {
    const options = body
      ? { body: JSON.stringify(body), headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
      : undefined
    return this.http
      .request<T>(method, url, options)
      .pipe(
        map((response: any) => {
          if (response?.data) return this.mapIncidentDetailUrls(response.data) as T
          return response || null
        })
      )
  }

  acceptAssignment(issueId: number): Observable<StaffIncidentDetailResponse | null> {
    return this.callAction('post', `${this.baseUrl}/staff/incidents/${issueId}/accept`)
  }

  rejectAssignment(issueId: number, note?: string): Observable<StaffIncidentDetailResponse | null> {
    return this.callAction('post', `${this.baseUrl}/staff/incidents/${issueId}/reject`, { note })
  }

  completeAssignment(issueId: number, note?: string): Observable<StaffIncidentDetailResponse | null> {
    return this.callAction('post', `${this.baseUrl}/staff/incidents/${issueId}/complete`, { note })
  }
}
