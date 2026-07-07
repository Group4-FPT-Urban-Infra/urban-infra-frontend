import { Component, input } from '@angular/core'
import { TranslatePipe } from '@ngx-translate/core'

@Component({
  selector: 'app-spinner',
  imports: [TranslatePipe],
  template: `
    <div role="status" class="flex items-center justify-center gap-3 p-8 text-gray-500">
      <span
        class="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"
      ></span>
      <span>{{ label() || ('common.loading' | translate) }}</span>
    </div>
  `,
})
export class SpinnerComponent {
  readonly label = input('')
}
