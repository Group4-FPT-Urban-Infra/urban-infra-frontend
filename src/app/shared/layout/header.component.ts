import { Component, EventEmitter, Input, Output, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterLink, RouterLinkActive } from '@angular/router'
import { AuthStore } from '../../core/auth/auth.store'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  styles: [
    `
      .nav-link-active {
        color: var(--color-primary);
        border-bottom: 2px solid var(--color-primary);
        padding-bottom: 2px;
      }
    `,
  ],
  template: `
    <nav
      class="sticky top-0 z-50 flex w-full items-center justify-between border-b border-[var(--color-outline-variant)] bg-[var(--color-surface)]/80 px-6 py-2 backdrop-blur-xl shadow-sm"
    >
      <!-- Left: Brand + Search -->
      <div class="flex items-center gap-6">
        <!-- Brand -->
        <div class="flex items-center gap-2">
          <span
            class="material-symbols-outlined text-[var(--color-primary)]"
            style="font-variation-settings:'FILL' 1; font-size:28px"
            aria-hidden="true"
            >security</span
          >
          <span class="text-xl font-bold tracking-tight text-[var(--color-primary)]"
            >CivicShield</span
          >
        </div>

        <!-- Search (desktop) -->
        <div
          class="hidden items-center gap-2 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] px-4 py-1.5 transition-colors focus-within:border-[var(--color-primary)] md:flex"
        >
          <span
            class="material-symbols-outlined text-[20px] text-[var(--color-outline)]"
            aria-hidden="true"
            >search</span
          >
          <input
            type="text"
            placeholder="Search incidents..."
            class="w-56 border-none bg-transparent text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      <!-- Center: Nav links (desktop) - Dashboard Tabs -->
      <div class="hidden items-center gap-6 md:flex">

        @switch (getUserRole()) {
          @case ('DepartmentStaff') {
            <!-- Staff Dashboard -->
            <a
              routerLink="/staff/dashboard"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Staff Dashboard
            </a>
            <a
              routerLink="/staff/map"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Map View
            </a>
            <a
              routerLink="/staff/incidents"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Incidents
            </a>
          }
          @case ('DepartmentManager') {
            <!-- Staff Manager Dashboard -->
            <a
              routerLink="/staff-manager/dashboard"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Manager Dashboard
            </a>
            <a
              routerLink="/staff-manager/map"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Map View
            </a>
            <a
              routerLink="/staff-manager/incidents"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Incidents
            </a>
            <a
              routerLink="/staff-manager/sla-alert"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              SLA & Alert
            </a>
            <a
              routerLink="/staff-manager/staffs"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Staffs
            </a>
          }
          @default {
            <!-- Citizen Dashboard (default) -->
            <a
              routerLink="/citizen/dashboard"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Dashboard
            </a>
            <a
              routerLink="/citizen/map"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Map View
            </a>
            <a
              routerLink="/citizen/reports"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Incidents
            </a>
          }
        }

        @if (store.isAuthenticated()) {
          <a
            routerLink="/incident-reporting"
            routerLinkActive="nav-link-active"
            class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
          >
            Report Issue
          </a>
        }
      </div>

      <!-- Right: Actions + Avatar -->
      <div class="flex items-center gap-2">
        <!-- Notifications -->
        <button
          class="rounded-full p-2 text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50"
          title="Notifications"
          type="button"
        >
          <span class="material-symbols-outlined text-[22px]" aria-hidden="true"
            >notifications</span
          >
        </button>

        <!-- Help -->
        <button
          class="hidden rounded-full p-2 text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50 sm:block"
          title="Help"
          type="button"
        >
          <span class="material-symbols-outlined text-[22px]" aria-hidden="true"
            >help_outline</span
          >
        </button>

        <!-- Language Selector -->
        <select
          aria-label="Language"
          [value]="translate.getCurrentLang()"
          (change)="onLocaleChange($event)"
          class="hidden h-8 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] px-2 text-xs font-medium text-[var(--color-on-surface)] sm:block"
        >
          @for (l of locales; track l) {
            <option [value]="l">{{ l.toUpperCase() }}</option>
          }
        </select>

        <!-- Avatar + Logout -->
        <div class="flex items-center gap-2 border-l border-[var(--color-outline-variant)] pl-3 ml-1">
          @if (store.isAuthenticated()) {
            <div
              class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[var(--color-outline-variant)]"
            >
              <div
                class="flex h-full w-full items-center justify-center bg-[var(--color-primary-fixed)] text-xs font-bold text-[var(--color-primary)]"
              >
                {{ getUserInitials() }}
              </div>
            </div>

            <div class="hidden text-left lg:block">
              <p class="text-xs font-semibold text-[var(--color-on-surface)]">
                {{ store.user()?.fullName || 'Admin User' }}
              </p>
            </div>

            <!-- Logout -->
            <button
              (click)="logout()"
              title="Logout"
              class="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--color-outline-variant)] px-2 text-xs text-[var(--color-on-surface-variant)] transition-colors hover:border-[var(--color-error)] hover:bg-[var(--color-error-container)] hover:text-[var(--color-on-error-container)]"
            >
              <span class="material-symbols-outlined text-[16px]" aria-hidden="true">logout</span>
              <span class="hidden sm:inline">Sign out</span>
            </button>
          } @else {
            <!-- Login/Register for guests -->
            <a
              routerLink="/login"
              class="inline-flex h-8 items-center gap-1 rounded-lg bg-[var(--color-primary)] px-4 text-xs font-medium text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary)]/90"
            >
              Sign In
            </a>
          }
        </div>

        <!-- Sidebar toggle (mobile) -->
        <button
          (click)="toggleSidebar.emit()"
          type="button"
          class="ml-1 rounded-lg p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] md:hidden"
          title="Toggle menu"
        >
          <span class="material-symbols-outlined text-[22px]" aria-hidden="true">menu</span>
        </button>
      </div>
    </nav>
  `,
})
export class HeaderComponent {
  @Input() sidebarCollapsed = false
  @Output() toggleSidebar = new EventEmitter<void>()

  protected readonly store = inject(AuthStore)
  protected readonly translate = inject(TranslateService)
  private readonly router = inject(Router)
  protected readonly locales = ['en', 'vi']

  getUserRole(): string {
    const user = this.store.user()
    if (!user) return 'Citizen'
    
    // Check roles array for role match
    if (user.roles.includes('DepartmentManager')) return 'DepartmentManager'
    if (user.roles.includes('DepartmentStaff')) return 'DepartmentStaff'
    if (user.roles.includes('Admin')) return 'Admin'
    
    return 'Citizen'
  }

  onLocaleChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value
    this.translate.use(lang)
    localStorage.setItem('app.locale', lang)
    document.documentElement.lang = lang
  }

  getUserInitials(): string {
    const name = this.store.user()?.fullName || 'Admin User'
    return name
      .split(' ')
      .map((n: string) => n[0])
      .slice(-2)
      .join('')
      .toUpperCase()
  }

  logout(): void {
    this.store.logout()
    void this.router.navigate(['/login'])
  }
}
