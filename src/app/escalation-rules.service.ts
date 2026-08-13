import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { env } from '../../src/app/core/config/env';
import {
  CreateEscalationRuleDto,
  EscalationRule,
  UpdateEscalationRuleDto,
} from './escalation-rules.types';

@Injectable({ providedIn: 'root' })
export class EscalationRulesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${env.apiBaseUrl}/escalation-rules`;

  getEscalationRules(): Observable<EscalationRule[]> {
    return this.http.get<EscalationRule[]>(this.apiUrl);
  }

  createEscalationRule(dto: CreateEscalationRuleDto): Observable<EscalationRule> {
    return this.http.post<EscalationRule>(this.apiUrl, dto);
  }

  updateEscalationRule(id: number, dto: UpdateEscalationRuleDto): Observable<EscalationRule> {
    return this.http.patch<EscalationRule>(`${this.apiUrl}/${id}`, dto);
  }

  deleteEscalationRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
