import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import type { AuthApiResponse, LoginPayload, RegisterPayload } from './auth.types'
import { env } from '../config/env'

export interface AuthUserProfile {
  id: string
  fullName: string
  email: string
  phoneNumber?: string
  roles: string[]
  departmentId?: number
  isActive: boolean
  createdAtUtc: string
}

/**
 * Auth API service — wraps the UrbanInfraSystem backend endpoints:
 *   GET  /api/auth/me
 *   POST /api/auth/login
 *   POST /api/auth/register
 *   POST /api/auth/refresh-token
 *   POST /api/auth/logout
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient)
  private readonly base = `${env.apiBaseUrl}/auth`

  login(payload: LoginPayload): Observable<AuthApiResponse> {
    return this.http.post<AuthApiResponse>(`${this.base}/login`, payload)
  }

  register(payload: RegisterPayload): Observable<AuthApiResponse> {
    return this.http.post<AuthApiResponse>(`${this.base}/register`, payload)
  }

  refreshToken(accessToken: string, refreshToken: string): Observable<AuthApiResponse> {
    return this.http.post<AuthApiResponse>(`${this.base}/refresh-token`, { accessToken, refreshToken })
  }

  logout(accessToken: string, refreshToken: string): Observable<void> {
    return this.http.post<void>(
      `${this.base}/logout`,
      { accessToken, refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
  }

  getMe(): Observable<AuthUserProfile> {
    return this.http.get<AuthUserProfile>(`${this.base}/me`)
  }
}
