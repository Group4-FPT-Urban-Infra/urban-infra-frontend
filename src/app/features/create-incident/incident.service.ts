import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'
import { delay } from 'rxjs/operators'
import { env } from '../../core/config/env'
import type {
  CreateIncidentPayload,
  DuplicateIncident,
  IncidentDetails,
  LocationData,
} from './incident.types'

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = env.apiBaseUrl

  checkDuplicates(
    location: LocationData,
    details: IncidentDetails
  ): Observable<DuplicateIncident[]> {
    // TODO: Replace with actual API call when backend is ready
    // return this.http.get<DuplicateIncident[]>(`${this.baseUrl}/incidents/check-duplicates`, {
    //   params: { lat: location.latitude, lng: location.longitude, category: details.category }
    // })

    // Mock response for development
    const mockDuplicates: DuplicateIncident[] = [
      {
        id: '1',
        title: 'Deep Pothole on Main St.',
        description: 'Large pothole causing traffic issues',
        status: 'Open',
        distance: 12,
        timeAgo: '2 hrs ago',
        icon: 'warning',
      },
      {
        id: '2',
        title: 'Damaged Sidewalk Paving',
        description: 'Broken pavement tiles creating hazard',
        status: 'Investigating',
        distance: 45,
        timeAgo: '1 day ago',
        icon: 'construction',
      },
    ]

    return of(mockDuplicates).pipe(delay(800))
  }

  createIncident(payload: CreateIncidentPayload): Observable<{ id: string }> {
    // TODO: Replace with actual API call when backend is ready
    // return this.http.post<{ id: string }>(`${this.baseUrl}/incidents`, payload)

    // Mock response for development
    return of({ id: `INC-${Date.now()}` }).pipe(delay(1500))
  }

  upvoteIncident(incidentId: string): Observable<void> {
    // TODO: Replace with actual API call when backend is ready
    // return this.http.post<void>(`${this.baseUrl}/incidents/${incidentId}/upvote`, {})

    return of(undefined).pipe(delay(500))
  }
}
