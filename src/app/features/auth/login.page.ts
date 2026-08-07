import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { AuthStore } from '../../core/auth/auth.store'
import { ButtonComponent } from '../../shared/ui/button'
import { CardComponent } from '../../shared/ui/card'

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, TranslatePipe, ButtonComponent, CardComponent],
  template: `
    <div class="flex min-h-screen items-center justify-center p-4">
      <app-card>
        <form class="flex w-80 flex-col gap-4 p-6" (ngSubmit)="submit()">
          <div>
            <h1 class="text-xl font-semibold">{{ 'auth.login' | translate }}</h1>
            <p class="mt-1 text-sm text-gray-500">
              {{ 'auth.signInToContinue' | translate }}
            </p>
          </div>
          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
              'auth.email' | translate
            }}</span>
            <input
              [(ngModel)]="email"
              name="email"
              type="email"
              required
              class="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
              'auth.password' | translate
            }}</span>
            <input
              [(ngModel)]="password"
              name="password"
              type="password"
              required
              class="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
          </label>
          @if (store.error()) {
            <p class="text-sm text-red-600">{{ 'auth.invalidCredentials' | translate }}</p>
          }
          <app-button type="submit" [loading]="store.status() === 'loading'">
            {{ 'auth.login' | translate }}
          </app-button>
          <p class="text-center text-xs text-gray-400">demo&#64;example.com / password</p>
        </form>
      </app-card>
    </div>
  `,
})
export class LoginPage {
  protected readonly store = inject(AuthStore)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)

  protected email = 'demo@example.com'
  protected password = 'password'

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
