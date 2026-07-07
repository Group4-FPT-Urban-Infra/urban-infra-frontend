import { inject } from '@angular/core'
import { HttpInterceptorFn } from '@angular/common/http'
import { TokenStorage } from '../auth/token-storage'

/** Attaches the bearer token to every outgoing request. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStorage).access
  if (!token) return next(req)
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
}
