import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { AuthService } from './auth.service'
import { TokenStorage } from './token-storage'
import type { AuthUser, LoginPayload, RegisterPayload } from './auth.types'

const USER_KEY = 'auth.user'

/**
 * Signal-based auth store. This is the native-Signals equivalent of an NgRx
 * SignalStore — state as signals, derived values as computed, async methods
 * mutating the signals. To migrate to @ngrx/signals later, replace this class
 * with `signalStore(withState(...), withMethods(...))` — call sites (which read
 * `store.user()`, `store.isAuthenticated()`) stay identical.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly auth = inject(AuthService)
  private readonly tokens = inject(TokenStorage)

  // --- state ---
  private readonly _user = signal<AuthUser | null>(this.restore())
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
  private readonly _error = signal<string | null>(null)

  // --- selectors ---
  readonly user = this._user.asReadonly()
  readonly status = this._status.asReadonly()
  readonly error = this._error.asReadonly()
  readonly isAuthenticated = computed(() => this._user() !== null)

  // --- methods ---
  async login(payload: LoginPayload): Promise<void> {
    this._status.set('loading')
    this._error.set(null)
    try {
      const res = await firstValueFrom(this.auth.login(payload))
      if (!res.success || !res.accessToken || !res.user) {
        throw new Error(res.message ?? 'invalidCredentials')
      }
      this.tokens.set(res.accessToken, res.refreshToken)
      this._user.set(res.user)
      localStorage.setItem(USER_KEY, JSON.stringify(res.user))
      this._status.set('idle')
    } catch (e) {
      this._status.set('error')
      this._error.set(e instanceof Error ? e.message : 'error')
      throw e
    }
  }

  async register(payload: RegisterPayload): Promise<void> {
    this._status.set('loading')
    this._error.set(null)
    try {
      const res = await firstValueFrom(this.auth.register(payload))
      if (!res.success) {
        throw new Error(res.message ?? 'registrationFailed')
      }
      // Auto-login after successful registration if tokens are returned
      if (res.accessToken && res.user) {
        this.tokens.set(res.accessToken, res.refreshToken)
        this._user.set(res.user)
        localStorage.setItem(USER_KEY, JSON.stringify(res.user))
      }
      this._status.set('idle')
    } catch (e) {
      this._status.set('error')
      this._error.set(e instanceof Error ? e.message : 'registrationFailed')
      throw e
    }
  }

  logout(): void {
    // Capture tokens BEFORE clearing — the auth interceptor reads from storage
    // so we need to fire the HTTP request first, then clear.
    const accessToken = this.tokens.access
    const refreshToken = this.tokens.refresh

    // Clear local state immediately so the UI reacts right away
    this.tokens.clear()
    localStorage.removeItem(USER_KEY)
    this._user.set(null)
    this._status.set('idle')
    this._error.set(null)

    // Fire-and-forget: revoke refresh token on the server.
    // Manually attach the access token since we already cleared storage.
    if (refreshToken && accessToken) {
      this.auth.logout(accessToken, refreshToken).subscribe({ error: () => {} })
    }
  }

  private restore(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  }
}
