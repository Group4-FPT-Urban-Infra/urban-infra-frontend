import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, TranslatePipe, RouterLink],
  styles: [
    `
      /* Filled icon variant */
      .icon-filled {
        font-variation-settings: 'FILL' 1;
      }

      /* Smooth arrow slide on hover */
      .btn-primary:hover .arrow-icon {
        transform: translateX(4px);
      }
      .arrow-icon {
        transition: transform 0.2s ease;
      }

      /* Focus ring for inputs */
      .civic-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-fixed) 60%, transparent);
      }
    `,
  ],
  template: `
    <!-- Full-page wrapper with dot-grid pattern -->
    <div
      class="bg-pattern relative flex min-h-screen items-center justify-center overflow-hidden px-4"
    >
      <!-- Ambient glow -->
      <div class="ambient-glow"></div>

      <!-- Login card container -->
      <main class="relative z-10 w-full max-w-[420px]">
        <div
          class="shadow-level-2 flex flex-col gap-6 rounded-xl border border-[var(--color-surface-container-high)] bg-[var(--color-surface-container-lowest)] p-8 backdrop-blur-sm"
        >
          <!-- ── Header ──────────────────────────────────────── -->
          <div class="mb-2 flex flex-col items-center text-center">
            <!-- Logo icon -->
            <div
              class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--color-primary-fixed-dim)] bg-[var(--color-primary-fixed)] shadow-sm"
            >
              <span
                class="material-symbols-outlined icon-filled text-[var(--color-primary)]"
                style="font-size:28px"
                aria-hidden="true"
                >security</span
              >
            </div>
            <h1 class="text-[28px] font-semibold leading-9 tracking-tight text-[var(--color-on-surface)]">
              CivicShield
            </h1>
            <p class="mt-1 text-sm text-[var(--color-on-surface-variant)]">
              Sign in to your management portal
            </p>
          </div>

          <!-- ── Form ───────────────────────────────────────── -->
          <form class="flex flex-col gap-4" (ngSubmit)="submit()" #loginForm="ngForm">
            <!-- Email field -->
            <div class="flex flex-col gap-1">
              <label
                class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]"
                for="email"
              >
                Email Address
              </label>
              <div class="relative">
                <span
                  class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[var(--color-outline-variant)]"
                  aria-hidden="true"
                  >mail</span
                >
                <input
                  [(ngModel)]="email"
                  name="email"
                  id="email"
                  type="email"
                  required
                  placeholder="name@organization.gov"
                  class="civic-input w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] py-[10px] pl-10 pr-4 text-sm text-[var(--color-on-surface)] shadow-sm placeholder:text-[var(--color-outline)] transition-all"
                />
              </div>
            </div>

            <!-- Password field -->
            <div class="flex flex-col gap-1">
              <label
                class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]"
                for="password"
              >
                Password
              </label>
              <div class="relative">
                <span
                  class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[var(--color-outline-variant)]"
                  aria-hidden="true"
                  >lock</span
                >
                <input
                  [(ngModel)]="password"
                  name="password"
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  required
                  placeholder="••••••••"
                  class="civic-input w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] py-[10px] pl-10 pr-10 text-sm text-[var(--color-on-surface)] shadow-sm placeholder:text-[var(--color-outline)] transition-all"
                />
                <!-- Toggle visibility -->
                <button
                  type="button"
                  id="togglePassword"
                  aria-label="Toggle password visibility"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--color-outline-variant)] transition-colors hover:text-[var(--color-on-surface)] focus:outline-none"
                >
                  <span class="material-symbols-outlined text-[20px]" aria-hidden="true">
                    {{ showPassword() ? 'visibility' : 'visibility_off' }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Options row: remember me + forgot password -->
            <div class="mt-1 mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <input
                  [(ngModel)]="rememberMe"
                  name="remember"
                  id="remember"
                  type="checkbox"
                  class="h-4 w-4 cursor-pointer rounded border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-fixed)]"
                />
                <label
                  for="remember"
                  class="cursor-pointer select-none text-sm text-[var(--color-on-surface-variant)]"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                class="text-sm font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-on-primary-fixed-variant)] hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <!-- Error message -->
            @if (store.error()) {
              <p class="rounded-lg bg-[var(--color-error-container)] px-3 py-2 text-sm text-[var(--color-on-error-container)]">
                {{ 'auth.invalidCredentials' | translate }}
              </p>
            }

            <!-- Submit button -->
            <button
              type="submit"
              id="loginSubmit"
              [disabled]="store.status() === 'loading'"
              class="btn-primary flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-on-primary-fixed-variant)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              @if (store.status() === 'loading') {
                <span
                  class="material-symbols-outlined animate-spin text-[18px]"
                  aria-hidden="true"
                  >progress_activity</span
                >
                Signing in…
              } @else {
                Sign In
                <span class="material-symbols-outlined arrow-icon text-[18px]" aria-hidden="true"
                  >arrow_forward</span
                >
              }
            </button>
          </form>

          <!-- ── Footer ─────────────────────────────────────── -->
          <div class="mt-1 border-t border-[var(--color-surface-container)] pt-4 text-center">
            <p class="text-sm text-[var(--color-on-surface-variant)]">
              Don't have an account?
              <a
                routerLink="/register"
                class="font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-on-primary-fixed-variant)] hover:underline"
              >
                Register
              </a>
            </p>
          </div>
        </div>

        <!-- Environment badge -->
        <div class="mt-6 text-center">
          <span
            class="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-surface-variant)] bg-[var(--color-surface-container)] px-3 py-1 text-[11px] font-medium text-[var(--color-on-surface-variant)] shadow-sm"
          >
            <span class="h-2 w-2 rounded-full bg-[var(--color-secondary)]"></span>
            Secure System
          </span>
        </div>
      </main>
    </div>
  `,
})
export class LoginPage {
  protected readonly store = inject(AuthStore)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  protected email = 'demo@example.com'
  protected password = 'password'
  protected rememberMe = false
  protected showPassword = signal(false)

  async submit(): Promise<void> {
    try {
      await this.store.login({ email: this.email, password: this.password })
      const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/'
      void this.router.navigateByUrl(redirect)
    } catch {
      /* error surfaced via store */
    }
  }
}
