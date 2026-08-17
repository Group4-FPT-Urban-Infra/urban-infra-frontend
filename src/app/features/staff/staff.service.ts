import { inject, Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../../core/config/env'
import {
  StaffDashboardSummary,
  StaffTask,
  StaffActivity,
  StaffMapIssue,
  StaffIncident,
  StaffIncidentDetail,
  StaffApiFilters,
} from './staff.types'

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly http = inject(HttpClient)
  private readonly apiUrl = `${env.apiBaseUrl}/staff`

  getDashboardSummary(): Observable<StaffDashboardSummary> {
    return this.http.get<StaffDashboardSummary>(`${this.apiUrl}/dashboard/summary`)
  }

  getMyTasks(): Observable<StaffTask[]> {
    return this.http.get<StaffTask[]>(`${this.apiUrl}/tasks/my`)
  }

  getMyRecentActivities(): Observable<StaffActivity[]> {
    return this.http.get<StaffActivity[]>(`${this.apiUrl}/activities/recent`)
  }

  getStaffMapIssues(filters?: StaffApiFilters): Observable<StaffMapIssue[]> {
    const params = this.buildParams(filters)
    return this.http.get<StaffMapIssue[]>(`${this.apiUrl}/issues/map`, { params })
  }

  getStaffIncidents(filters?: StaffApiFilters): Observable<StaffIncident[]> {
    const params = this.buildParams(filters)
    return this.http.get<StaffIncident[]>(`${this.apiUrl}/incidents`, { params })
  }

  getStaffIncident(id: string): Observable<StaffIncidentDetail> {
    return this.http.get<StaffIncidentDetail>(`${this.apiUrl}/incidents/${id}`)
  }

  claimIncident(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/incidents/${id}/claim`, {})
  }

  private buildParams(filters?: StaffApiFilters): HttpParams {
    let params = new HttpParams()
    if (!filters) return params
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)) {
        if (Array.isArray(value)) {
          value.forEach((v: string) => {
            params = params.append(key, v)
          })
        } else {
          params = params.append(key, String(value))
        }
      }
    })
    return params
  }
}
