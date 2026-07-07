import { Injectable, computed, inject, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { UsersService } from './users.service'
import type { CreateUserInput, UpdateUserInput, User } from './users.types'

/** Signal store for the Users feature (see AuthStore for the pattern rationale). */
@Injectable({ providedIn: 'root' })
export class UsersStore {
  private readonly api = inject(UsersService)

  private readonly _items = signal<User[]>([])
  private readonly _status = signal<'idle' | 'loading' | 'error'>('idle')
  private readonly _mutating = signal(false)
  private readonly _search = signal('')

  readonly status = this._status.asReadonly()
  readonly mutating = this._mutating.asReadonly()
  readonly search = this._search

  readonly filtered = computed(() => {
    const q = this._search().trim().toLowerCase()
    const items = this._items()
    if (!q) return items
    return items.filter((u) =>
      [u.name, u.username, u.email].some((v) => v.toLowerCase().includes(q)),
    )
  })

  async load(): Promise<void> {
    this._status.set('loading')
    try {
      this._items.set(await firstValueFrom(this.api.list()))
      this._status.set('idle')
    } catch {
      this._status.set('error')
    }
  }

  async create(input: CreateUserInput): Promise<void> {
    this._mutating.set(true)
    try {
      const created = await firstValueFrom(this.api.create(input))
      this._items.update((list) => [{ ...created, id: created.id || Date.now() }, ...list])
    } finally {
      this._mutating.set(false)
    }
  }

  async update(id: number, input: UpdateUserInput): Promise<void> {
    this._mutating.set(true)
    try {
      const updated = await firstValueFrom(this.api.update(id, input))
      this._items.update((list) => list.map((u) => (u.id === id ? { ...u, ...updated } : u)))
    } finally {
      this._mutating.set(false)
    }
  }

  async remove(id: number): Promise<void> {
    await firstValueFrom(this.api.remove(id))
    this._items.update((list) => list.filter((u) => u.id !== id))
  }
}
