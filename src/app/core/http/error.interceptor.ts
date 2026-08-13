import { inject } from '@angular/core'
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { Router } from '@angular/router'
import { catchError, throwError } from 'rxjs'
import { ApiError } from './api-error'
import { TokenStorage } from '../auth/token-storage'

/**
 * Central error handling: normalizes every failure into an `ApiError`.
 *
 * NOTE: 401 errors are handled by authInterceptor with refresh-token logic.
 * This interceptor acts as a safety net for 401s that authInterceptor cannot resolve
 * (e.g., refresh token also expired/invalid).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const tokens = inject(TokenStorage)

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Safety net for 401: authInterceptor should have handled this with refresh,
      // but if it fails, we clear tokens and redirect to login.
      // Skip for auth endpoints to avoid redirect loops during login/register.
      if (error.status === 401) {
        const url = req.url
        const isAuthEndpoint =
          url.includes('/auth/login') ||
          url.includes('/auth/register') ||
          url.includes('/auth/refresh-token')

        if (!isAuthEndpoint) {
          tokens.clear()
          localStorage.removeItem('auth.user')
          void router.navigate(['/login'])
        }
      }

      const body = error.error as
        { message?: string; code?: string; errors?: Record<string, string[]> } | undefined
      return throwError(
        () => new ApiError(error.status, body?.message ?? error.message, body?.code, body?.errors),
      )
    }),
  )
}
