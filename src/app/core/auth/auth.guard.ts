import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthStore } from './auth.store'

/** Blocks protected routes; redirects to /login preserving the target URL. */
export const authGuard: CanActivateFn = (_route, state) => {
  const store = inject(AuthStore)
  const router = inject(Router)

  if (store.isAuthenticated()) return true
  return router.createUrlTree(['/login'], {
    queryParams: { redirect: state.url },
  })
}

/** Keeps authenticated users away from /login. */
export const guestGuard: CanActivateFn = () => {
  const store = inject(AuthStore)
  const router = inject(Router)
  return store.isAuthenticated() ? router.createUrlTree(['/']) : true
}

/** Restricts access based on roles. */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const store = inject(AuthStore)
    const router = inject(Router)
    
    if (!store.isAuthenticated()) {
      return router.createUrlTree(['/login'])
    }
    
    const userRoles = store.user()?.roles || []
    const hasRole = allowedRoles.some(role => userRoles.includes(role))
    
    if (!hasRole) {
      return router.createUrlTree(['/'])
    }
    
    return true
  }
}
