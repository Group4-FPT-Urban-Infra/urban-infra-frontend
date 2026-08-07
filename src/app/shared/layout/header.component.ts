import { Component, EventEmitter, Input, Output, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { AuthStore } from '../../core/auth/auth.store'
import { env } from '../../core/config/env'
import { TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      <!-- Left: Sidebar Toggle & Brand -->
      <div class="flex items-center gap-3">
        <button
          (click)="toggleSidebar.emit()"
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          title="Toggle Navigation Menu"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-md shadow-orange-500/20">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="hidden sm:block">
            <h1 class="text-base font-bold tracking-tight text-slate-900 dark:text-white">Urban Infrastructure Portal</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Hệ thống Báo cáo & Xử lý Sự cố Hạ tầng Đô thị</p>
          </div>
        </div>
      </div>

      <!-- Right: Actions, Language, User Info & Logout -->
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Quick Stats SLA Badge -->
        <div class="hidden md:flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
          <span class="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>94.2% Sự cố đạt cam kết SLA</span>
        </div>

        <!-- Language Selector -->
        <select
          aria-label="Language"
          [value]="translate.getCurrentLang()"
          (change)="onLocaleChange($event)"
          class="h-9 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
        >
          @for (l of locales; track l) {
            <option [value]="l">{{ l.toUpperCase() }}</option>
          }
        </select>

        <!-- User Profile Dropdown -->
        <div class="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
              {{ getUserInitials() }}
            </div>
            <div class="hidden text-left lg:block">
              <p class="text-xs font-semibold text-slate-900 dark:text-white">
                {{ store.user()?.name || 'Cán bộ Xử lý' }}
              </p>
              <span class="inline-flex items-center rounded-md bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20 dark:bg-orange-900/30 dark:text-orange-400">
                Đội Quản lý Đô thị
              </span>
            </div>
          </div>

          <!-- Logout Button -->
          <button
            (click)="logout()"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors dark:border-slate-800 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @Input() sidebarCollapsed = false
  @Output() toggleSidebar = new EventEmitter<void>()

  protected readonly store = inject(AuthStore)
  protected readonly translate = inject(TranslateService)
  private readonly router = inject(Router)
  protected readonly locales = env.supportedLocales

  onLocaleChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value
    this.translate.use(lang)
    localStorage.setItem('app.locale', lang)
    document.documentElement.lang = lang
  }

  getUserInitials(): string {
    const name = this.store.user()?.name || 'Cán bộ Xử lý'
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
