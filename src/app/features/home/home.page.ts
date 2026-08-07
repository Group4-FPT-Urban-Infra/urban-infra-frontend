import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { TranslatePipe } from '@ngx-translate/core'
import { CardComponent } from '../../shared/ui/card'

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, TranslatePipe, CardComponent],
  template: `
    <section class="flex flex-col gap-6">
      <div>
        <h1 class="text-3xl font-bold">{{ 'app.name' | translate }}</h1>
        <p class="mt-2 text-gray-500">{{ 'app.tagline' | translate }}</p>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        @for (f of features; track f) {
          <app-card
            ><div class="p-4 text-sm font-medium">{{ f }}</div></app-card
          >
        }
      </div>
      <a routerLink="/users" class="text-brand-600 hover:underline">
        {{ 'nav.users' | translate }} →
      </a>
    </section>
  `,
})
export class HomePage {
  protected readonly features = [
    'Angular 22 standalone',
    'Signals stores',
    'Router + guards (lazy)',
    'Tailwind CSS v4',
    'ngx-translate (en/vi)',
    'HttpClient + interceptors',
  ]
}
