import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p class="text-brand-600 text-6xl font-black">404</p>
      <p class="text-gray-500">{{ 'common.notFound' | translate }}</p>
      <a routerLink="/" class="text-brand-600 hover:underline">
        {{ 'common.backHome' | translate }}
      </a>
    </div>
  `,
})
export class NotFoundPage {}
