import { Component, effect, input, output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslatePipe } from '@ngx-translate/core'
import { ButtonComponent } from '../../shared/ui/button'
import { CardComponent } from '../../shared/ui/card'
import type { CreateUserInput, User } from './users.types'

@Component({
  selector: 'app-user-form-dialog',
  imports: [FormsModule, TranslatePipe, ButtonComponent, CardComponent],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <app-card>
          <form class="flex w-96 max-w-full flex-col gap-4 p-6" (ngSubmit)="save.emit({ ...form })">
            <h2 class="text-lg font-semibold">
              {{ (initial() ? 'users.edit' : 'users.create') | translate }}
            </h2>
            @for (field of fields; track field.key) {
              <label class="flex flex-col gap-1">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{
                  field.label | translate
                }}</span>
                <input
                  [(ngModel)]="form[field.key]"
                  [name]="field.key"
                  [type]="field.type"
                  required
                  class="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
              </label>
            }
            <div class="flex justify-end gap-2">
              <app-button type="button" variant="secondary" (click)="close.emit()">
                {{ 'users.cancel' | translate }}
              </app-button>
              <app-button type="submit" [loading]="submitting()">
                {{ 'users.save' | translate }}
              </app-button>
            </div>
          </form>
        </app-card>
      </div>
    }
  `,
})
export class UserFormDialog {
  readonly open = input(false)
  readonly initial = input<User | null>(null)
  readonly submitting = input(false)
  readonly close = output<void>()
  readonly save = output<CreateUserInput>()

  protected form: CreateUserInput = { name: '', username: '', email: '' }
  protected readonly fields = [
    { key: 'name', label: 'users.name', type: 'text' },
    { key: 'username', label: 'users.username', type: 'text' },
    { key: 'email', label: 'users.email', type: 'email' },
  ] as const

  constructor() {
    // Reset the form whenever the dialog opens or the edit target changes.
    effect(() => {
      const u = this.initial()
      this.open()
      this.form = {
        name: u?.name ?? '',
        username: u?.username ?? '',
        email: u?.email ?? '',
      }
    })
  }
}
