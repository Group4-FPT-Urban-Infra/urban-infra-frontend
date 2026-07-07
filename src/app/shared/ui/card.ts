import { Component } from '@angular/core'

@Component({
  selector: 'app-card',
  template: `
    <div
      class="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <ng-content />
    </div>
  `,
})
export class CardComponent {}
