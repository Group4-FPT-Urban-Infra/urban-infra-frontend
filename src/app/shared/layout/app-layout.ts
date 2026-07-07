import { Component, inject } from '@angular/core'
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { TranslatePipe, TranslateService } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
import { env } from '../../core/config/env'
import { ButtonComponent } from '../ui/button'

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe, ButtonComponent],
  template: `
    <div class="mx-auto flex min-h-screen max-w-5xl flex-col">
      <header
        class="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-3 dark:border-gray-800"
      >
        <div class="flex items-center gap-6">
          <span class="text-brand-600 text-lg font-bold">{{ 'app.name' | translate }}</span>
          <nav class="flex items-center gap-1">
            <a
              routerLink="/"
              routerLinkActive="!bg-brand-50 !text-brand-700 dark:!bg-brand-500/10"
              [routerLinkActiveOptions]="{ exact: true }"
              class="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >{{ 'nav.home' | translate }}</a
            >
            <a
              routerLink="/users"
              routerLinkActive="!bg-brand-50 !text-brand-700 dark:!bg-brand-500/10"
              class="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >{{ 'nav.users' | translate }}</a
            >
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <select
            aria-label="Language"
            [value]="translate.getCurrentLang()"
            (change)="onLocaleChange($event)"
            class="h-9 rounded-lg border border-gray-300 bg-white px-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            @for (l of locales; track l) {
              <option [value]="l">{{ l.toUpperCase() }}</option>
            }
          </select>
          @if (store.user(); as user) {
            <span class="text-sm text-gray-500">{{ user.name }}</span>
          }
          <app-button variant="ghost" size="sm" (click)="logout()">
            {{ 'nav.logout' | translate }}
          </app-button>
        </div>
      </header>

      <main class="flex-1 p-4">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppLayoutComponent {
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

  logout(): void {
    this.store.logout()
    void this.router.navigate(['/login'])
  }
}
