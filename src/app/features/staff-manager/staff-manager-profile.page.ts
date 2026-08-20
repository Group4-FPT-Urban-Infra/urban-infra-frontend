import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { AuthService, AuthUserProfile } from '../../core/auth/auth.service'
import { formatLocalDate, parseUtcDate } from '../../core/utils/date.utils'

@Component({
  selector: 'app-staff-manager-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[var(--color-surface)] p-4 md:p-8">
      <!-- Page Header -->
      <div class="mb-6 flex items-center gap-3">
        <a
          routerLink="/staff-manager/dashboard"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)] shadow-sm transition-all hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface)]"
        >
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        </a>
        <div>
          <h2 class="text-[36px] font-bold text-[var(--color-on-surface)]" style="letter-spacing: -0.02em; line-height: 44px;">
            My Profile
          </h2>
          <p class="mt-1 text-[14px] text-[var(--color-on-surface-variant)]">
            View and manage your account information.
          </p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
        </div>
      } @else if (error()) {
        <div class="rounded-xl border border-[var(--color-error)]/30 bg-[var(--color-error-container)] p-6 text-center">
          <span class="material-symbols-outlined text-[32px] text-[var(--color-error)]">error</span>
          <p class="mt-2 text-[14px] font-medium text-[var(--color-error)]">{{ error() }}</p>
        </div>
      } @else if (profile()) {
        <!-- Profile Card -->
        <div class="max-w-2xl rounded-2xl border border-[var(--color-outline-variant)]/40 bg-white shadow-[0px_4px_24px_rgba(0,0,0,0.06)]">
          <!-- Avatar & Basic Info -->
          <div class="flex flex-col items-center gap-4 border-b border-[var(--color-outline-variant)]/30 p-8">
            <div class="relative">
              <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-container)] ring-4 ring-[var(--color-primary-container)]">
                <span class="text-[32px] font-bold text-[var(--color-on-primary-container)]">{{ getInitials(profile()!.fullName) }}</span>
              </div>
              <span class="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#22C55E]">
                <span class="material-symbols-outlined text-[10px] text-white" style="font-variation-settings:'FILL' 1;">check</span>
              </span>
            </div>
            <div class="text-center">
              <h3 class="text-[22px] font-bold text-[var(--color-on-surface)]">{{ profile()!.fullName }}</h3>
              <p class="mt-0.5 text-[14px] text-[var(--color-on-surface-variant)]">{{ profile()!.email }}</p>
              <div class="mt-2 flex flex-wrap justify-center gap-2">
                @for (role of profile()!.roles; track role) {
                  <span class="rounded-full bg-[var(--color-secondary-container)] px-3 py-1 text-[11px] font-semibold text-[var(--color-on-secondary-container)]">
                    {{ formatRole(role) }}
                  </span>
                }
              </div>
            </div>
          </div>

          <!-- Details -->
          <div class="divide-y divide-[var(--color-outline-variant)]/20">
            <!-- Full Name -->
            <div class="flex items-center gap-4 px-8 py-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                <span class="material-symbols-outlined text-[20px]">badge</span>
              </div>
              <div class="flex-1">
                <p class="text-[11px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">Full Name</p>
                <p class="mt-0.5 text-[14px] font-semibold text-[var(--color-on-surface)]">{{ profile()!.fullName }}</p>
              </div>
            </div>

            <!-- Email -->
            <div class="flex items-center gap-4 px-8 py-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                <span class="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <div class="flex-1">
                <p class="text-[11px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">Email</p>
                <p class="mt-0.5 text-[14px] font-semibold text-[var(--color-on-surface)]">{{ profile()!.email }}</p>
              </div>
            </div>

            <!-- Phone -->
            <div class="flex items-center gap-4 px-8 py-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                <span class="material-symbols-outlined text-[20px]">phone</span>
              </div>
              <div class="flex-1">
                <p class="text-[11px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">Phone Number</p>
                <p class="mt-0.5 text-[14px] font-semibold text-[var(--color-on-surface)]">
                  {{ profile()!.phoneNumber ?? '—' }}
                </p>
              </div>
            </div>

            <!-- Status -->
            <div class="flex items-center gap-4 px-8 py-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                <span class="material-symbols-outlined text-[20px]">toggle_on</span>
              </div>
              <div class="flex-1">
                <p class="text-[11px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">Account Status</p>
                <p class="mt-0.5">
                  <span [class]="profile()!.isActive ? 'rounded-full bg-[#DCFCE7] px-3 py-1 text-[12px] font-semibold text-[#166534]' : 'rounded-full bg-[#FEE2E2] px-3 py-1 text-[12px] font-semibold text-[#991B1B]'">
                    {{ profile()!.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </p>
              </div>
            </div>

            <!-- Department -->
            @if (profile()!.departmentId) {
              <div class="flex items-center gap-4 px-8 py-4">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                  <span class="material-symbols-outlined text-[20px]">apartment</span>
                </div>
                <div class="flex-1">
                  <p class="text-[11px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">Department ID</p>
                  <p class="mt-0.5 text-[14px] font-semibold text-[var(--color-on-surface)]">{{ profile()!.departmentId }}</p>
                </div>
              </div>
            }

            <!-- Member Since -->
            <div class="flex items-center gap-4 px-8 py-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]">
                <span class="material-symbols-outlined text-[20px]">calendar_month</span>
              </div>
              <div class="flex-1">
                <p class="text-[11px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">Member Since</p>
                <p class="mt-0.5 text-[14px] font-semibold text-[var(--color-on-surface)]">{{ formatDate(profile()!.createdAtUtc) }}</p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `],
})
export class StaffManagerProfileComponent implements OnInit {
  private readonly authService = inject(AuthService)

  profile = signal<AuthUserProfile | null>(null)
  loading = signal(true)
  error = signal<string | null>(null)

  ngOnInit(): void {
    this.loadProfile()
  }

  loadProfile(): void {
    this.loading.set(true)
    this.error.set(null)
    this.authService.getMe().subscribe({
      next: (data) => {
        this.profile.set(data)
        this.loading.set(false)
      },
      error: (err) => {
        this.error.set('Failed to load profile. Please try again.')
        this.loading.set(false)
        console.error('Profile load error:', err)
      },
    })
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  formatRole(role: string): string {
    const roleMap: Record<string, string> = {
      Admin: 'Admin',
      DepartmentStaff: 'Staff Manager',
      Citizen: 'Citizen',
    }
    return roleMap[role] ?? role
  }

  formatDate(isoString: string): string {
    return formatLocalDate(isoString, 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
}
