import { inject } from '@angular/core'
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { Router } from '@angular/router'
import { catchError, throwError } from 'rxjs'
import { ApiError } from './api-error'
import { TokenStorage } from '../auth/token-storage'

/**
 * Central error handling: normalizes every failure into an `ApiError` and,
 * on 401, clears the session and redirects to /login.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router)
  const tokens = inject(TokenStorage)

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        tokens.clear()
        void router.navigate(['/login'])
      }
      const body = error.error as
        { message?: string; code?: string; errors?: Record<string, string[]> } | undefined
      return throwError(
        () => new ApiError(error.status, body?.message ?? error.message, body?.code, body?.errors),
      )
    }),
  )
}
