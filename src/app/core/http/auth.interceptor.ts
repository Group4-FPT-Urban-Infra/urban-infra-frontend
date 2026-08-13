import { inject } from '@angular/core'
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http'
import { Router } from '@angular/router'
import { Observable, throwError, BehaviorSubject, from, timer } from 'rxjs'
import { switchMap, filter, take, catchError, tap, finalize } from 'rxjs/operators'
import { TokenStorage } from '../auth/token-storage'
import { AuthService } from '../auth/auth.service'
import { AuthStore } from '../auth/auth.store'

/**
 * Prevents multiple simultaneous refresh attempts.
 * Only the first 401 triggers a refresh; subsequent ones wait for it.
 */
let isRefreshing = false
const refreshTokenSubject = new BehaviorSubject<string | null>(null)

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

      // Prevent multiple simultaneous refresh attempts
      if (isRefreshing) {
        // Wait for the ongoing refresh to complete, then retry with new token
        return refreshTokenSubject.pipe(
          filter((token) => token !== null),
          take(1),
          switchMap((newToken) => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            })
            return next(retryReq)
          }),
          catchError((err) => {
            handleRefreshFailure()
            return throwError(() => err)
          })
        )
      }

      isRefreshing = true
      refreshTokenSubject.next(null)

      const refreshToken = tokenStorage.refresh

      // If no refresh token, redirect to login
      if (!refreshToken) {
        handleRefreshFailure()
        return throwError(() => error)
      }

      const accessToken = tokenStorage.access

      // Attempt to refresh
      return from(authService.refreshToken(accessToken!, refreshToken)).pipe(
        switchMap((res) => {
          if (res.success && res.accessToken && res.refreshToken) {
            // Store new tokens
            tokenStorage.set(res.accessToken, res.refreshToken)

            // Update auth store with new user data if available
            if (res.user) {
              authStore['_user'].set(res.user)
              localStorage.setItem('auth.user', JSON.stringify(res.user))
            }

            refreshTokenSubject.next(res.accessToken)

            // Retry original request with new token
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` },
            })
            return next(retryReq)
          } else {
            handleRefreshFailure()
            return throwError(() => new Error(res.message ?? 'Token refresh failed'))
          }
        }),
        catchError((err) => {
          handleRefreshFailure()
          return throwError(() => err)
        }),
        finalize(() => {
          isRefreshing = false
        })
      )
    })
  )

  function handleRefreshFailure(): void {
    isRefreshing = false
    refreshTokenSubject.next(null)
    tokenStorage.clear()
    localStorage.removeItem('auth.user')
    authStore['_user'].set(null)
    void router.navigate(['/login'])
  }
}
