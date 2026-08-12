import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'

// ──────────────────────────────────────────────
//  Filter / Request / Response interfaces
// ──────────────────────────────────────────────

export interface AreaFilterRequest {
  parentAreaId?: number
  areaType?: string
  isActive?: boolean
  search?: string
}

export interface AreaResponse {
  areaId: number
  parentAreaId?: number | null
  parentAreaName?: string | null
  areaCode: string
  areaName: string
  /** e.g. "City", "District", "Ward", "Zone" */
  areaType: string
  /** GeoJSON boundary (optional) */
  boundary?: unknown | null
  centroidLatitude?: number | null
  centroidLongitude?: number | null
  isActive: boolean
  createdAt: string
  updatedAt?: string | null
  subAreas?: AreaResponse[] | null
}

export interface CreateAreaRequest {
  parentAreaId?: number | null
  /** max 30 chars, required */
  areaCode: string
  /** max 150 chars, required */
  areaName: string
  /** max 30 chars, required  e.g. "City" | "District" | "Ward" | "Zone" */
  areaType: string
  boundary?: unknown | null
  centroidLatitude?: number | null
  centroidLongitude?: number | null
  isActive: boolean
}

export interface UpdateAreaRequest extends CreateAreaRequest {}

// ──────────────────────────────────────────────
//  Service
// ──────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AreaManagementService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiBaseUrl}/Areas`

  /** GET /api/Areas – list with optional filters */
  getAreas(filter?: AreaFilterRequest): Observable<AreaResponse[]> {
    let params = new HttpParams()
    if (filter) {
      if (filter.parentAreaId !== undefined && filter.parentAreaId !== null)
        params = params.set('ParentAreaId', filter.parentAreaId.toString())
      if (filter.areaType) params = params.set('AreaType', filter.areaType)
      if (filter.isActive !== undefined) params = params.set('IsActive', filter.isActive.toString())
      if (filter.search) params = params.set('Search', filter.search)
    }
    return this.http.get<AreaResponse[]>(this.baseUrl, { params })
  }

  /** GET /api/Areas/{id} – single area with sub-areas */
  getArea(id: number): Observable<AreaResponse> {
    return this.http.get<AreaResponse>(`${this.baseUrl}/${id}`)
  }

  /** POST /api/Areas – create area */
  createArea(request: CreateAreaRequest): Observable<AreaResponse> {
    return this.http.post<AreaResponse>(this.baseUrl, request)
  }

  /** PUT /api/Areas/{id} – update area */
  updateArea(id: number, request: UpdateAreaRequest): Observable<AreaResponse> {
    return this.http.put<AreaResponse>(`${this.baseUrl}/${id}`, request)
  }

  /** DELETE /api/Areas/{id} – delete area (fails if sub-areas exist) */
  deleteArea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
  }
}
