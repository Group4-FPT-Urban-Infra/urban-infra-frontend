import { inject } from '@angular/core'
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { Router } from '@angular/router'
import { Observable, throwError } from 'rxjs'
import { switchMap, catchError, finalize, map, shareReplay } from 'rxjs/operators'
import { TokenStorage } from '../auth/token-storage'
import { AuthService } from '../auth/auth.service'
import { AuthStore } from '../auth/auth.store'

/**
 * Prevents multiple simultaneous refresh attempts.
 * Only the first 401 triggers a refresh; subsequent ones wait for it.
 */
let refreshRequest$: Observable<string> | null = null

/** Checks if a request should NOT trigger a token refresh. */
function isAuthRequest(req: HttpRequest<unknown>): boolean {
  const url = req.url
  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh-token')
}

/** Attaches bearer token and retries with new token on 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorage)
  const authService = inject(AuthService)
  const authStore = inject(AuthStore)
  const router = inject(Router)

  // Attach token if available (skip for auth endpoints that don't need it)
  const authToken = tokenStorage.access
  const clonedReq = authToken && !isAuthRequest(req)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${authToken}` } })
    : req

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only attempt refresh for 401 on non-auth endpoints
      if (error.status !== 401 || isAuthRequest(req)) {
        // For 401 on auth endpoints (like /mine), clear tokens and redirect
        if (error.status === 401 && !isAuthRequest(req)) {
          tokenStorage.clear()
          localStorage.removeItem('auth.user')
          authStore['_user'].set(null)
          void router.navigate(['/login'])
        }
        return throwError(() => error)
      }

      const refreshToken = tokenStorage.refresh

      // If no refresh token, redirect to login
      if (!refreshToken) {
        handleRefreshFailure()
        return throwError(() => error)
      }

      const accessToken = tokenStorage.access
      if (!accessToken) {
        handleRefreshFailure()
        return throwError(() => error)
      }

      if (!refreshRequest$) {
        refreshRequest$ = authService.refreshToken(accessToken, refreshToken).pipe(
          map((res) => {
            if (!res.success || !res.accessToken || !res.refreshToken) {
              throw new Error(res.message ?? 'Token refresh failed')
            }
            authStore.updateSession(res.accessToken, res.refreshToken, res.user)
            return res.accessToken
          }),
          catchError((err) => {
            handleRefreshFailure()
            return throwError(() => err)
          }),
          finalize(() => { refreshRequest$ = null }),
          shareReplay({ bufferSize: 1, refCount: false }),
        )
      }

      return refreshRequest$.pipe(
        switchMap((newToken) => next(req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` },
        }))),
      )
    })
  )

  function handleRefreshFailure(): void {
    refreshRequest$ = null
    authStore.clearSession()
    void router.navigate(['/login'])
  }
}
