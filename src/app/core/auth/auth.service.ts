import { Injectable } from '@angular/core'
import { Observable, delay, of, throwError } from 'rxjs'
import type { LoginPayload, LoginResponse } from './auth.types'

/**
 * Auth API. Ships a MOCK so the starter runs with no backend. To use a real
 * API, inject HttpClient and return `this.http.post<LoginResponse>(...)`.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  login(payload: LoginPayload): Observable<LoginResponse> {
    if (payload.password !== 'password') {
      return throwError(() => new Error('invalidCredentials')).pipe(delay(500))
    }
    return of<LoginResponse>({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: { id: 1, name: 'Demo User', email: payload.email },
    }).pipe(delay(500))
  }
}
