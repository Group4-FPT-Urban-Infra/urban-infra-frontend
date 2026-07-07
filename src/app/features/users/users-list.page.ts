import { Component, OnInit, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { TranslatePipe } from '@ngx-translate/core'
import { UsersStore } from './users.store'
import { UserFormDialog } from './user-form-dialog'
import { ButtonComponent } from '../../shared/ui/button'
import { CardComponent } from '../../shared/ui/card'
import { SpinnerComponent } from '../../shared/ui/spinner'
import type { CreateUserInput, User } from './users.types'

@Component({
  selector: 'app-users-list-page',
  imports: [
    FormsModule,
    TranslatePipe,
    UserFormDialog,
    ButtonComponent,
    CardComponent,
    SpinnerComponent,
  ],
  template: `
    <section class="flex flex-col gap-4">
      <div class="flex items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold">{{ 'users.title' | translate }}</h1>
        <app-button (click)="openCreate()">{{ 'users.create' | translate }}</app-button>
      </div>

      <input
        [ngModel]="store.search()"
        (ngModelChange)="store.search.set($event)"
        [placeholder]="'users.search' | translate"
        class="h-10 max-w-sm rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900"
      />

      @switch (store.status()) {
        @case ('loading') {
          <app-spinner />
        }
        @case ('error') {
          <div class="flex flex-col items-center gap-3 p-8">
            <p class="text-red-600">{{ 'common.error' | translate }}</p>
            <app-button variant="secondary" (click)="store.load()">
              {{ 'common.retry' | translate }}
            </app-button>
          </div>
        }
        @default {
          <app-card>
            <table class="w-full text-left text-sm">
              <thead
                class="border-b border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-800/50"
              >
                <tr>
                  <th class="px-4 py-3 font-medium">{{ 'users.name' | translate }}</th>
                  <th class="px-4 py-3 font-medium">{{ 'users.username' | translate }}</th>
                  <th class="px-4 py-3 font-medium">{{ 'users.email' | translate }}</th>
                  <th class="px-4 py-3 text-right font-medium">
                    {{ 'users.actions' | translate }}
                  </th>
                </tr>
              </thead>
              <tbody>
                @for (u of store.filtered(); track u.id) {
                  <tr class="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td class="px-4 py-3 font-medium">{{ u.name }}</td>
                    <td class="px-4 py-3 text-gray-500">{{ '@' + u.username }}</td>
                    <td class="px-4 py-3 text-gray-500">{{ u.email }}</td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end gap-2">
                        <app-button size="sm" variant="secondary" (click)="openEdit(u)">
                          {{ 'users.edit' | translate }}
                        </app-button>
                        <app-button size="sm" variant="danger" (click)="store.remove(u.id)">
                          {{ 'users.delete' | translate }}
                        </app-button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="px-4 py-8 text-center text-gray-400">
                      {{ 'users.empty' | translate }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </app-card>
        }
      }

      <app-user-form-dialog
        [open]="dialogOpen()"
        [initial]="editing()"
        [submitting]="store.mutating()"
        (close)="dialogOpen.set(false)"
        (save)="handleSave($event)"
      />
    </section>
  `,
})
export class UsersListPage implements OnInit {
  protected readonly store = inject(UsersStore)
  protected readonly dialogOpen = signal(false)
  protected readonly editing = signal<User | null>(null)

  ngOnInit(): void {
    void this.store.load()
  }

  openCreate(): void {
    this.editing.set(null)
    this.dialogOpen.set(true)
  }

  openEdit(user: User): void {
    this.editing.set(user)
    this.dialogOpen.set(true)
  }

  async handleSave(input: CreateUserInput): Promise<void> {
    const current = this.editing()
    if (current) await this.store.update(current.id, input)
    else await this.store.create(input)
    this.dialogOpen.set(false)
  }
}
