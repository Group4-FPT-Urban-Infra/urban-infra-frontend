import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../src/app/core/config/env';
import { SlaPolicy } from './admin.types';

@Injectable({ providedIn: 'root' })
export class SlaPoliciesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${env.apiBaseUrl}/sla-policies`;

  getSlaPolicies(): Observable<SlaPolicy[]> {
    // In a real app, you might want to handle pagination
    return this.http.get<SlaPolicy[]>(this.apiUrl);
  }
}
