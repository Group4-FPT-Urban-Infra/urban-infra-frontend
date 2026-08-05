import { Component, EventEmitter, Input, Output, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { AuthStore } from '../../core/auth/auth.store'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
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

      <!-- Center: Nav links (desktop) -->
      <div class="hidden items-center gap-6 md:flex">
        
         <a
          href="#"
          class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50"
        >
          Dashboard
        </a>
        <a
          href="#"
          class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50"
        >
          Incidents
        </a>
        <a
          href="#"
          class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50"
        >
          Resources
        </a>
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
              {{ store.user()?.name || 'Admin User' }}
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

  onLocaleChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value
    this.translate.use(lang)
    localStorage.setItem('app.locale', lang)
    document.documentElement.lang = lang
  }

  getUserInitials(): string {
    const name = this.store.user()?.name || 'Admin User'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(-2)
      .join('')
      .toUpperCase()
  }

  logout(): void {
    this.store.logout()
    void this.router.navigate(['/login'])
  }
}
