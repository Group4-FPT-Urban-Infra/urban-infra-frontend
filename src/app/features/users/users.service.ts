import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../../core/config/env'
import type { CreateUserInput, UpdateUserInput, User } from './users.types'

/** Users API. Talks to env.apiBaseUrl (jsonplaceholder in dev, which fakes writes). */
@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient)
  private readonly base = `${env.apiBaseUrl}/users`

  list(): Observable<User[]> {
    return this.http.get<User[]>(this.base)
  }

  get(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`)
  }

  create(input: CreateUserInput): Observable<User> {
    return this.http.post<User>(this.base, input)
  }

  update(id: number, input: UpdateUserInput): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}`, input)
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`)
  }
}
