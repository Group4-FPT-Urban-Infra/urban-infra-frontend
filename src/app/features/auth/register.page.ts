import { Component, inject, signal, computed } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'

@Component({
  selector: 'app-register-page',
  imports: [FormsModule, RouterLink],
  styles: [
    `
      /* Filled icon variant */
      .icon-filled {
        font-variation-settings: 'FILL' 1;
      }

      /* Focus ring for inputs */
      .civic-input:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-fixed) 60%, transparent);
      }

      /* Arrow slide on hover */
      .btn-primary:hover .arrow-icon {
        transform: translateX(4px);
      }
      .arrow-icon {
        transition: transform 0.2s ease;
      }
    `,
  ],
  template: `
    <div class="flex min-h-screen w-full text-[var(--color-on-surface)]">

      <!-- ── Left column: Branding / Hero (hidden on mobile) ───────────── -->
      <div
        class="relative hidden flex-col justify-between overflow-hidden lg:flex lg:w-1/2"
        style="
          background-image: url('/civic_register_bg.jpg');
          background-size: cover;
          background-position: center;
        "
      >
        <!-- Dark gradient overlay for legibility -->
        <div
          class="absolute inset-0"
          style="background: linear-gradient(to top, rgba(0,23,75,0.88) 0%, rgba(0,23,75,0.38) 50%, transparent 100%)"
        ></div>

        <!-- Brand anchor -->
        <div class="relative z-10 p-12">
          <div class="flex items-center gap-2 text-white">
            <span
              class="material-symbols-outlined icon-filled"
              style="font-size:32px"
              aria-hidden="true"
              >security</span
            >
            <span class="text-3xl font-bold tracking-tight">CivicShield</span>
          </div>
        </div>

        <!-- Value proposition -->
        <div class="relative z-10 max-w-lg p-12 text-white">
          <h2 class="mb-4 text-[28px] font-semibold leading-9">
            Empowering secure civic management.
          </h2>
          <p class="text-base leading-6 opacity-90">
            Join our network of urban infrastructure professionals. Access real-time analytics,
            report incidents, and manage city resources efficiently in one centralized platform.
          </p>
        </div>
      </div>

      <!-- ── Right column: Registration form ───────────────────────────── -->
      <div
        class="flex w-full items-center justify-center bg-[var(--color-surface)] p-4 md:p-8 lg:w-1/2"
      >
        <div
          class="shadow-level-2 relative w-full max-w-[480px] overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] p-8"
        >
          <!-- Decorative blur blob top-right -->
          <div
            class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
            style="background: color-mix(in srgb, var(--color-primary-fixed) 30%, transparent)"
          ></div>

          <div class="relative z-10">

            <!-- Mobile brand anchor -->
            <div class="mb-8 flex items-center gap-2 text-[var(--color-primary)] lg:hidden">
              <span
                class="material-symbols-outlined icon-filled text-[28px]"
                aria-hidden="true"
                >security</span
              >
              <span class="text-2xl font-bold tracking-tight text-[var(--color-on-surface)]">
                CivicShield
              </span>
            </div>

            <!-- Header -->
            <div class="mb-8">
              <h1 class="mb-2 text-[28px] font-semibold leading-9 text-[var(--color-on-surface)]">
                Create an account
              </h1>
              <p class="text-sm text-[var(--color-on-surface-variant)]">
                Enter your details to register for the platform.
              </p>
            </div>

            <!-- ── Form ─────────────────────────────────────────────── -->
            <form class="flex flex-col gap-4" (ngSubmit)="submit()" #regForm="ngForm">

              <!-- Full Name -->
              <div class="flex flex-col gap-1">
                <label
                  for="fullName"
                  class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]"
                >
                  Full Name
                </label>
                <div class="relative">
                  <span
                    class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[var(--color-outline)]"
                    aria-hidden="true"
                    >person</span
                  >
                  <input
                    [(ngModel)]="fullName"
                    name="fullName"
                    id="fullName"
                    type="text"
                    required
                    placeholder="Jane Doe"
                    class="civic-input w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-on-surface)] shadow-sm placeholder:text-[var(--color-outline-variant)] transition-all"
                  />
                </div>
              </div>

              <!-- Email -->
              <div class="flex flex-col gap-1">
                <label
                  for="regEmail"
                  class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]"
                >
                  Email Address
                </label>
                <div class="relative">
                  <span
                    class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[var(--color-outline)]"
                    aria-hidden="true"
                    >mail</span
                  >
                  <input
                    [(ngModel)]="email"
                    name="email"
                    id="regEmail"
                    type="email"
                    required
                    placeholder="jane.doe@example.com"
                    class="civic-input w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-on-surface)] shadow-sm placeholder:text-[var(--color-outline-variant)] transition-all"
                  />
                </div>
              </div>

              <!-- Phone -->
              <div class="flex flex-col gap-1">
                <label
                  for="phone"
                  class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]"
                >
                  Phone Number
                </label>
                <div class="relative">
                  <span
                    class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[var(--color-outline)]"
                    aria-hidden="true"
                    >phone_iphone</span
                  >
                  <input
                    [(ngModel)]="phone"
                    name="phone"
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    class="civic-input w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-on-surface)] shadow-sm placeholder:text-[var(--color-outline-variant)] transition-all"
                  />
                </div>
              </div>

              <!-- Password -->
              <div class="flex flex-col gap-1">
                <label
                  for="regPassword"
                  class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]"
                >
                  Password
                </label>
                <div class="relative">
                  <span
                    class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[var(--color-outline)]"
                    aria-hidden="true"
                    >lock</span
                  >
                  <input
                    [(ngModel)]="password"
                    name="password"
                    id="regPassword"
                    [type]="showPassword() ? 'text' : 'password'"
                    required
                    placeholder="••••••••"
                    (ngModelChange)="onPasswordChange()"
                    class="civic-input w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] py-2.5 pl-10 pr-10 text-sm text-[var(--color-on-surface)] shadow-sm placeholder:text-[var(--color-outline-variant)] transition-all"
                  />
                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    (click)="showPassword.set(!showPassword())"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-outline)] transition-colors hover:text-[var(--color-on-surface)] focus:outline-none"
                  >
                    <span class="material-symbols-outlined text-[20px]" aria-hidden="true">
                      {{ showPassword() ? 'visibility' : 'visibility_off' }}
                    </span>
                  </button>
                </div>

                <!-- Password strength indicator -->
                <div class="mt-1.5 flex flex-col gap-1.5">
                  <div class="flex h-1 w-full gap-1">
                    <div
                      class="w-1/3 rounded-full transition-colors duration-300"
                      [style.background-color]="strengthBarColor(0)"
                    ></div>
                    <div
                      class="w-1/3 rounded-full transition-colors duration-300"
                      [style.background-color]="strengthBarColor(1)"
                    ></div>
                    <div
                      class="w-1/3 rounded-full transition-colors duration-300"
                      [style.background-color]="strengthBarColor(2)"
                    ></div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span
                      class="text-[11px] font-medium leading-4"
                      [style.color]="strengthLabelColor()"
                    >
                      {{ strengthLabel() }}
                    </span>
                    <span class="text-[11px] text-[var(--color-outline-variant)]">
                      Min. 8 characters
                    </span>
                  </div>
                </div>
              </div>

              <!-- Confirm Password -->
              <div class="flex flex-col gap-1">
                <label
                  for="confirmPassword"
                  class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]"
                >
                  Confirm Password
                </label>
                <div class="relative">
                  <span
                    class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[var(--color-outline)]"
                    aria-hidden="true"
                    >lock_reset</span
                  >
                  <input
                    [(ngModel)]="confirmPassword"
                    name="confirmPassword"
                    id="confirmPassword"
                    [type]="showPassword() ? 'text' : 'password'"
                    required
                    placeholder="••••••••"
                    class="civic-input w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-on-surface)] shadow-sm placeholder:text-[var(--color-outline-variant)] transition-all"
                    [class.border-red-400]="confirmPassword && confirmPassword !== password"
                  />
                </div>
                @if (confirmPassword && confirmPassword !== password) {
                  <p class="mt-0.5 text-[11px] text-[var(--color-error)]">
                    Passwords do not match.
                  </p>
                }
              </div>

              <!-- Terms -->
              <div class="mt-2 flex items-start gap-2">
                <input
                  [(ngModel)]="agreedToTerms"
                  name="terms"
                  id="terms"
                  type="checkbox"
                  class="mt-1 h-4 w-4 cursor-pointer rounded border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-fixed)]"
                />
                <label
                  for="terms"
                  class="cursor-pointer text-sm text-[var(--color-on-surface-variant)]"
                >
                  I agree to the
                  <a
                    href="#"
                    class="text-[12px] font-medium text-[var(--color-primary)] hover:underline"
                    >Terms of Service</a
                  >
                  and
                  <a
                    href="#"
                    class="text-[12px] font-medium text-[var(--color-primary)] hover:underline"
                    >Privacy Policy</a
                  >.
                </label>
              </div>

              <!-- Error banner -->
              @if (errorMessage()) {
                <p
                  class="rounded-lg bg-[var(--color-error-container)] px-3 py-2 text-sm text-[var(--color-on-error-container)]"
                >
                  {{ errorMessage() }}
                </p>
              }

              <!-- Submit -->
              <button
                type="submit"
                id="registerSubmit"
                [disabled]="isLoading() || !canSubmit()"
                class="btn-primary mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] py-3 text-sm font-semibold text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-on-primary-fixed-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-fixed)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                @if (isLoading()) {
                  <span
                    class="material-symbols-outlined animate-spin text-[18px]"
                    aria-hidden="true"
                    >progress_activity</span
                  >
                  Registering…
                } @else {
                  <span>Register Account</span>
                  <span class="material-symbols-outlined arrow-icon text-[18px]" aria-hidden="true"
                    >arrow_forward</span
                  >
                }
              </button>
            </form>

            <!-- Navigation to login -->
            <div
              class="mt-6 border-t border-[var(--color-outline-variant)]/30 pt-6 text-center"
            >
              <p class="text-sm text-[var(--color-on-surface-variant)]">
                Already have an account?
                <a
                  routerLink="/login"
                  class="text-[12px] font-medium text-[var(--color-primary)] transition-all hover:underline"
                >
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="absolute bottom-6 w-full text-center pointer-events-none">
        </div>
      </div>
    </div>
  `,
})
export class RegisterPage {
  private readonly router = inject(Router)

  // ── Form fields ────────────────────────────────────────────────────────
  protected fullName = ''
  protected email = ''
  protected phone = ''
  protected password = ''
  protected confirmPassword = ''
  protected agreedToTerms = false

  // ── UI state ───────────────────────────────────────────────────────────
  protected showPassword = signal(false)
  protected isLoading = signal(false)
  protected errorMessage = signal<string | null>(null)

  // ── Password strength ──────────────────────────────────────────────────
  private readonly strengthScore = signal(0)   // 0 = empty, 1 = weak, 2 = medium, 3 = strong

  protected readonly strengthLabel = computed(() => {
    const s = this.strengthScore()
    if (s === 0) return ''
    if (s === 1) return 'Weak'
    if (s === 2) return 'Medium strength'
    return 'Strong'
  })

  protected readonly strengthLabelColor = computed(() => {
    const s = this.strengthScore()
    if (s === 1) return 'var(--color-error)'
    if (s === 2) return 'var(--color-tertiary-container)'
    if (s === 3) return 'var(--color-secondary)'
    return 'var(--color-outline-variant)'
  })

  protected strengthBarColor(index: number): string {
    const s = this.strengthScore()
    if (index >= s) return 'var(--color-surface-container-highest)'
    if (s === 1) return 'var(--color-error)'
    if (s === 2) return 'var(--color-tertiary-fixed-dim)'
    return 'var(--color-secondary)'
  }

  protected onPasswordChange(): void {
    const p = this.password
    if (!p) { this.strengthScore.set(0); return }
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    this.strengthScore.set(Math.max(score, 1) as 1 | 2 | 3)
  }

  // ── Derived ────────────────────────────────────────────────────────────
  protected readonly canSubmit = computed(
    () =>
      this.fullName.trim().length > 0 &&
      this.email.trim().length > 0 &&
      this.password.length >= 8 &&
      this.password === this.confirmPassword &&
      this.agreedToTerms,
  )

  // ── Submit ─────────────────────────────────────────────────────────────
  async submit(): Promise<void> {
    if (!this.canSubmit()) return
    this.isLoading.set(true)
    this.errorMessage.set(null)
    try {
      // TODO: wire up real registration API call
      await new Promise((r) => setTimeout(r, 1200))
      void this.router.navigateByUrl('/login')
    } catch {
      this.errorMessage.set('Registration failed. Please try again.')
    } finally {
      this.isLoading.set(false)
    }
  }
}
