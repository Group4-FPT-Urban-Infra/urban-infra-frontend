import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, map, forkJoin, of } from 'rxjs'
import { env } from '../../core/config/env'

export interface DashboardStatsResponse {
  activeIssuesCount: number
  resolvedThisWeekCount: number
  citizenUsersCount: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface PagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface IssueSummaryResponse {
  id: number
  publicCode: string
  title: string
  issueType: { id: number; name: string; code: string }
  area: { id: number; name: string; code: string }
  priority: { id: number; name: string; code: string }
  status: { id: number; name: string; code: string }
  latitude: number
  longitude: number
  thumbnailUrl?: string
  upvoteCount: number
  hasUpvoted: boolean
  reportedAt: string
}

export interface NearbyIssueResponse extends IssueSummaryResponse {
  distanceMeters: number
}

// Lookup types for filters
export interface IssueTypeLookup {
  issueTypeId: number
  typeCode: string
  typeName: string
  iconUrl?: string
}

export interface IssueStatusLookup {
  statusId: number
  statusCode: string
  statusName: string
  displayOrder: number
}

export interface IssuePriorityLookup {
  priorityId: number
  priorityCode: string
  priorityName: string
  severityRank: number
}

// Custom color settings for issue types
export interface IssueTypeColorSettings {
  [issueTypeId: number]: string
}

// Legacy types for citizen dashboard
export interface DashboardStats {
  totalReports: number
  resolved: number
  helpfulnessScore: number
}

export interface IssueDetailResponse extends IssueSummaryResponse {
  description: string
  addressText?: string
  reporterDisplayName: string
  currentDepartment?: { id: number; name: string }
  duplicateOf?: { id: number; publicCode: string }
  resolvedAt?: string
  closedAt?: string
  updatedAt: string
  attachments: IssueAttachmentResponse[]
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
  fromStatus?: { id: number; name: string; code: string }
  toStatus?: { id: number; name: string; code: string }
  progressPercent?: number
  note?: string
  isSystemGenerated: boolean
  createdAt: string
  attachments: IssueAttachmentResponse[]
}

export interface UpvoteResponse {
  issueId: number
  hasUpvoted: boolean
  upvoteCount: number
}

export interface ReportSummaryResponse {
  id: number
  publicCode: string
  title: string
  area: { id: number; name: string; code: string }
  latitude: number
  longitude: number
  thumbnailUrl?: string
  upvoteCount: number
  hasUpvoted: boolean
  reportedAt: string
  issueCount: number
  resolvedIssueCount: number
  issueTypes: { id: number; name: string; code: string }[]
}

export interface ReportIssueResponse {
  id: number
  publicCode: string
  issueType: { id: number; name: string; code: string }
  priority: { id: number; name: string; code: string }
  status: { id: number; name: string; code: string }
  currentDepartment?: { id: number; name: string; code: string }
  reportedAt: string
  resolvedAt?: string
}

export interface ReportDetailResponse extends ReportSummaryResponse {
  description: string
  addressText?: string
  reporterDisplayName: string
  attachments: IssueAttachmentResponse[]
  issues: ReportIssueResponse[]
}

export interface ReportUpdateResponse extends IssueTimelineItemResponse {
  reportId: number
  reportPublicCode: string
  reportTitle: string
  issueId: number
  issuePublicCode: string
}

export interface SearchIssuesOptions {
  page?: number
  pageSize?: number
  keyword?: string
  issueTypeId?: number
  statusCodes?: string[]
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = env.apiBaseUrl

  private getStaticBaseUrl(): string {
    return this.baseUrl.replace(/\/api$/, '')
  }

  get<T>(endpoint: string, options?: { params?: HttpParams }): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, options)
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body)
  }

  getStats(): Observable<DashboardStatsResponse> {
    return this.http
      .get<ApiResponse<DashboardStatsResponse>>(`${this.baseUrl}/dashboard/stats`)
      .pipe(
        map((response) => {
          if (!response.success) {
            return {
              activeIssuesCount: 0,
              resolvedThisWeekCount: 0,
              citizenUsersCount: 0,
            }
          }
          return response.data!
        })
      )
  }

  getLatestIssues(limit = 10): Observable<IssueSummaryResponse[]> {
    const params = new HttpParams()
      .set('page', '1')
      .set('pageSize', String(limit))
      .set('sort', 'reportedAtDesc')

    return this.http
      .get<ApiResponse<PagedResponse<IssueSummaryResponse>>>(`${this.baseUrl}/issues`, { params })
      .pipe(
        map((response) => {
          return response.data?.items || []
        })
      )
  }

  searchIssues(options: SearchIssuesOptions = {}): Observable<PagedResponse<IssueSummaryResponse>> {
    let params = new HttpParams()
      .set('page', String(options.page ?? 1))
      .set('pageSize', String(options.pageSize ?? 20))
      .set('sort', 'reportedAtDesc')

    if (options.keyword?.trim()) params = params.set('keyword', options.keyword.trim())
    if (options.issueTypeId) params = params.set('issueTypeId', String(options.issueTypeId))
    options.statusCodes?.forEach((code) => (params = params.append('statusCodes', code)))

    return this.http
      .get<ApiResponse<PagedResponse<IssueSummaryResponse>>>(`${this.baseUrl}/issues`, { params })
      .pipe(map((response) => response.data))
  }

  getTimeline(issueId: number): Observable<IssueTimelineItemResponse[]> {
    return this.http
      .get<ApiResponse<IssueTimelineItemResponse[]>>(`${this.baseUrl}/issues/${issueId}/timeline`)
      .pipe(map((response) => response.data ?? []))
  }

  upvoteIssue(issueId: number): Observable<UpvoteResponse> {
    return this.http
      .post<ApiResponse<UpvoteResponse>>(`${this.baseUrl}/issues/${issueId}/upvote`, {})
      .pipe(map((response) => response.data))
  }

  removeUpvote(issueId: number): Observable<UpvoteResponse> {
    return this.http
      .delete<ApiResponse<UpvoteResponse>>(`${this.baseUrl}/issues/${issueId}/upvote`)
      .pipe(map((response) => response.data))
  }

  getNearbyIssues(
    latitude: number,
    longitude: number,
    radiusMeters = 2000,
    options?: {
      issueTypeId?: number
      statusCodes?: string[]
      priorityCodes?: string[]
      fromDate?: string
      toDate?: string
      limit?: number
      withinDays?: number
    }
  ): Observable<NearbyIssueResponse[]> {
    let params = new HttpParams()
      .set('latitude', String(latitude))
      .set('longitude', String(longitude))
      .set('radiusMeters', String(radiusMeters))
      .set('limit', String(options?.limit ?? 50))
      .set('withinDays', String(options?.withinDays ?? 365))

    if (options?.issueTypeId) {
      params = params.set('issueTypeId', String(options.issueTypeId))
    }
    if (options?.statusCodes && options.statusCodes.length > 0) {
      options.statusCodes.forEach(code => {
        params = params.append('statusCodes', code)
      })
    }
    if (options?.priorityCodes && options.priorityCodes.length > 0) {
      options.priorityCodes.forEach(code => {
        params = params.append('priorityCodes', code)
      })
    }
    if (options?.fromDate) {
      params = params.set('fromDate', options.fromDate)
    }
    if (options?.toDate) {
      params = params.set('toDate', options.toDate)
    }

    return this.http
      .get<ApiResponse<NearbyIssueResponse[]>>(`${this.baseUrl}/issues/nearby`, { params })
      .pipe(
        map((response) => {
          return response.data || []
        })
      )
  }

  getImageUrl(relativePath: string | null | undefined): string | null {
    if (!relativePath) return null
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath
    }
    return `${this.getStaticBaseUrl()}${relativePath}`
  }

  // ─── Legacy methods for citizen dashboard ─────────────────────────────────

  /**
   * Get user dashboard statistics (for citizen my-reports page)
   */
  getMyStats(): Observable<DashboardStats> {
    return this.http
      .get<DashboardStats>(`${this.baseUrl}/dashboard/stats`)
      .pipe(
        map((response) => {
          if (!response || typeof response !== 'object') {
            return { totalReports: 0, resolved: 0, helpfulnessScore: 0 }
          }
          // Map from new response format to legacy format
          return {
            totalReports: (response as any).activeIssuesCount ?? 0,
            resolved: (response as any).resolvedThisWeekCount ?? 0,
            helpfulnessScore: (response as any).citizenUsersCount ?? 0,
          }
        })
      )
  }

  /**
   * Get user's submitted issues (for citizen my-reports page)
   */
  getMyReports(): Observable<ReportSummaryResponse[]> {
    return this.http
      .get<ApiResponse<PagedResponse<ReportSummaryResponse>>>(`${this.baseUrl}/reports/mine?pageSize=20`)
      .pipe(
        map((response) => {
          return response.data?.items || []
        })
      )
  }

  getReportById(id: number): Observable<ReportDetailResponse> {
    return this.http.get<ApiResponse<ReportDetailResponse>>(`${this.baseUrl}/reports/${id}`)
      .pipe(map((response) => response.data))
  }

  getMyReportUpdates(limit = 5): Observable<ReportUpdateResponse[]> {
    return this.http.get<ApiResponse<ReportUpdateResponse[]>>(`${this.baseUrl}/reports/mine/updates?limit=${limit}`)
      .pipe(map((response) => response.data ?? []))
  }

  upvoteReport(reportId: number): Observable<UpvoteResponse> {
    return this.http.post<ApiResponse<UpvoteResponse>>(`${this.baseUrl}/reports/${reportId}/upvote`, {})
      .pipe(map((response) => response.data))
  }

  removeReportUpvote(reportId: number): Observable<UpvoteResponse> {
    return this.http.delete<ApiResponse<UpvoteResponse>>(`${this.baseUrl}/reports/${reportId}/upvote`)
      .pipe(map((response) => response.data))
  }

  /**
   * Get full issue detail by ID
   */
  getIssueById(id: number): Observable<IssueDetailResponse> {
    return this.http
      .get<ApiResponse<IssueDetailResponse>>(`${this.baseUrl}/issues/${id}`)
      .pipe(
        map((response) => {
          if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to load issue')
          }
          return response.data
        })
      )
  }

  formatTimeAgo(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hr ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return d.toLocaleDateString()
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-US')
  }

  // ─── Filter Lookup Methods ───────────────────────────────────────────────

  /**
   * Get active issue types for filter dropdown
   */
  getIssueTypes(): Observable<IssueTypeLookup[]> {
    return this.http
      .get<any>(`${this.baseUrl}/issue-types/lookup`)
      .pipe(
        map((response) => {
          // Backend wraps in ApiResponse with data as array for flat mode
          const data = response?.data ?? response
          if (Array.isArray(data)) {
            return data.map((item: any) => ({
              issueTypeId: item.issueTypeId ?? item.IssueTypeId,
              typeCode: item.typeCode ?? item.TypeCode ?? '',
              typeName: item.typeName ?? item.TypeName ?? '',
              iconUrl: item.iconUrl ?? item.IconUrl,
            }))
          }
          return []
        })
      )
  }

  /**
   * Get active issue statuses for filter
   */
  getIssueStatuses(): Observable<IssueStatusLookup[]> {
    return this.http
      .get<any>(`${this.baseUrl}/issue-statuses?activeOnly=true`)
      .pipe(
        map((response) => {
          // Backend returns array directly, not wrapped in ApiResponse
          const data = Array.isArray(response) ? response : (response?.data ?? [])
          if (Array.isArray(data)) {
            const items = data.map((item: any) => ({
              statusId: item.statusId ?? item.StatusId,
              statusCode: item.statusCode ?? item.StatusCode ?? '',
              statusName: item.statusName ?? item.StatusName ?? '',
              displayOrder: item.displayOrder ?? item.DisplayOrder ?? 0,
            }))
            return items.sort((a, b) => a.displayOrder - b.displayOrder)
          }
          return []
        })
      )
  }

  /**
   * Get active issue priorities for filter
   */
  getIssuePriorities(): Observable<IssuePriorityLookup[]> {
    return this.http
      .get<any>(`${this.baseUrl}/issue-priorities?activeOnly=true`)
      .pipe(
        map((response) => {
          // Backend returns array directly, not wrapped in ApiResponse
          const data = Array.isArray(response) ? response : (response?.data ?? [])
          if (Array.isArray(data)) {
            const items = data.map((item: any) => ({
              priorityId: item.priorityId ?? item.PriorityId,
              priorityCode: item.priorityCode ?? item.PriorityCode ?? '',
              priorityName: item.priorityName ?? item.PriorityName ?? '',
              severityRank: item.severityRank ?? item.SeverityRank ?? 0,
            }))
            return items.sort((a, b) => a.severityRank - b.severityRank)
          }
          return []
        })
      )
  }

  // ─── Custom Color Settings (localStorage) ────────────────────────────────

  private readonly COLOR_STORAGE_KEY = 'issue_type_colors'

  getIssueTypeColors(): IssueTypeColorSettings {
    try {
      const stored = localStorage.getItem(this.COLOR_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  saveIssueTypeColors(colors: IssueTypeColorSettings): void {
    localStorage.setItem(this.COLOR_STORAGE_KEY, JSON.stringify(colors))
  }

  getIssueTypeColor(issueTypeId: number): string | null {
    const colors = this.getIssueTypeColors()
    return colors[issueTypeId] || null
  }

  setIssueTypeColor(issueTypeId: number, color: string): void {
    const colors = this.getIssueTypeColors()
    colors[issueTypeId] = color
    this.saveIssueTypeColors(colors)
  }

  resetIssueTypeColors(): void {
    localStorage.removeItem(this.COLOR_STORAGE_KEY)
  }
}
