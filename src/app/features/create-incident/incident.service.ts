import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, map } from 'rxjs'
import { env } from '../../core/config/env'
import type {
  AreaLookupItem,
  CreateIncidentPayload,
  DuplicateIncident,
  IssueTypeLookupItem,
  NearbyIssueResponse,
  PriorityLookupItem,
} from './incident.types'

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = env.apiBaseUrl

  /**
   * Get areas for dropdown
   * GET /api/areas?isActive=true
   */
  getAreas(): Observable<AreaLookupItem[]> {
    const params = new HttpParams().set('isActive', 'true')
    return this.http.get<AreaLookupItem[]>(`${this.baseUrl}/areas`, { params })
  }

  /**
   * Get issue types for dropdown
   * GET /api/issue-types/lookup?mode=flat
   */
  getIssueTypes(): Observable<IssueTypeLookupItem[]> {
    return this.http.get<{ data: IssueTypeLookupItem[] } | IssueTypeLookupItem[]>(
      `${this.baseUrl}/issue-types/lookup?mode=flat`
    ).pipe(
      map((response) => {
        // Handle both wrapped and unwrapped responses
        if (Array.isArray(response)) {
          return response
        }
        return response.data || []
      })
    )
  }

  /**
   * Get priorities for dropdown
   * GET /api/issue-priorities?activeOnly=true
   */
  getPriorities(): Observable<PriorityLookupItem[]> {
    const params = new HttpParams().set('activeOnly', 'true')
    return this.http.get<PriorityLookupItem[]>(`${this.baseUrl}/issue-priorities`, { params })
  }

  /**
   * Check nearby duplicate incidents
   * GET /api/issues/nearby
   */
  checkDuplicates(
    location: { latitude: number; longitude: number },
    issueTypeId: number
  ): Observable<DuplicateIncident[]> {
    const params = new HttpParams()
      .set('issueTypeId', issueTypeId.toString())
      .set('latitude', location.latitude.toString())
      .set('longitude', location.longitude.toString())
      .set('radiusMeters', '500')
      .set('withinDays', '30')
      .set('limit', '10')

    return this.http.get<{ data: NearbyIssueResponse[] } | NearbyIssueResponse[]>(
      `${this.baseUrl}/issues/nearby`,
      { params }
    ).pipe(
      map((response) => {
        const items: NearbyIssueResponse[] = Array.isArray(response)
          ? response
          : (response.data || [])

        return items.map((item) => ({
          id: String(item.id),
          title: item.title,
          description: '',
          status: (item.status as unknown as { name?: string })?.name || item.status?.['name'] || 'Open',
          distance: item.distanceMeters,
          timeAgo: this.formatTimeAgo(new Date(item.reportedAt)),
          icon: 'warning',
        }))
      })
    )
  }

  /**
   * Upvote an incident
   * POST /api/issues/{incidentId}/upvote
   */
  upvoteIncident(incidentId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/issues/${incidentId}/upvote`, {})
  }

  /**
   * Create a new incident
   * POST /api/issues (multipart/form-data)
   */
  createIncident(payload: CreateIncidentPayload): Observable<{ id: number; publicCode: string; issues?: { id: number }[] }> {
    const formData = new FormData()

    // Required fields
    payload.details.issueTypeIds.forEach((id) => formData.append('issueTypeIds', String(id)))
    formData.append('areaId', String(payload.details.areaId))
    formData.append('title', payload.details.title)
    formData.append('description', payload.details.description)
    formData.append('latitude', String(payload.location.latitude))
    formData.append('longitude', String(payload.location.longitude))

    // Optional fields
    if (payload.location.address) {
      formData.append('addressText', payload.location.address)
    }
    if (payload.details.priorityId) {
      formData.append('priorityId', String(payload.details.priorityId))
    }

    // Photos
    for (const photo of payload.photos) {
      formData.append('images', photo.file)
    }

    return this.http.post<{ success: boolean; data?: { id: number; publicCode: string; issues?: { id: number }[] }; message?: string }>(
      `${this.baseUrl}/reports`,
      formData
    ).pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data
        }
        throw new Error(response.message || 'Failed to create incident')
      })
    )
  }

  /**
   * Format date to "time ago" string
   */
  private formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hr ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }
}
