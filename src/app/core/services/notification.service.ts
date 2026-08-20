import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'
import { CreateNotificationPayload, NotificationItem } from '../models/notification.model'

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiBaseUrl}/notifications`

  getUnreadNotifications(userId?: string): Observable<NotificationItem[]> {
    let params = new HttpParams()
    if (userId) {
      params = params.set('user_id', userId)
    }
    return this.http.get<NotificationItem[]>(this.baseUrl, { params })
  }

  getReadNotifications(userId?: string): Observable<NotificationItem[]> {
    let params = new HttpParams()
    if (userId) {
      params = params.set('user_id', userId)
    }
    return this.http.get<NotificationItem[]>(`${this.baseUrl}/read`, { params })
  }

  getAllNotifications(userId?: string): Observable<NotificationItem[]> {
    let params = new HttpParams()
    if (userId) {
      params = params.set('user_id', userId)
    }
    return this.http.get<NotificationItem[]>(`${this.baseUrl}/all`, { params })
  }

  createNotification(payload: CreateNotificationPayload): Observable<NotificationItem> {
    return this.http.post<NotificationItem>(this.baseUrl, payload)
  }

  markAsRead(id: number, userId?: string): Observable<unknown> {
    let params = new HttpParams()
    if (userId) {
      params = params.set('user_id', userId)
    }
    return this.http.put(`${this.baseUrl}/${id}/read`, {}, { params })
  }

  markAllAsRead(userId?: string): Observable<unknown> {
    let params = new HttpParams()
    if (userId) {
      params = params.set('user_id', userId)
    }
    return this.http.put(`${this.baseUrl}/read-all`, {}, { params })
  }
}
