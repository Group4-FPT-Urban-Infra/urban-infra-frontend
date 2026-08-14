import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EscalationRuleResponse {
  id: string;
  slaPolicyId: string;
  overdueMinutes: number;
  targetDepartmentId?: number;
  targetDepartmentName?: string;
  targetRoleName?: string;
  escalationLevel: number;
  notificationTitle?: string;
  notificationTemplate?: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export interface CreateEscalationRuleRequest {
  slaPolicyId: string;
  overdueMinutes: number;
  targetDepartmentId?: number;
  targetRoleName?: string;
  escalationLevel: number;
  notificationTitle?: string;
  notificationTemplate?: string;
  isActive: boolean;
}

export interface UpdateEscalationRuleRequest {
  slaPolicyId: string;
  overdueMinutes: number;
  targetDepartmentId?: number;
  targetRoleName?: string;
  escalationLevel: number;
  notificationTitle?: string;
  notificationTemplate?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EscalationRulesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  getAll(): Observable<EscalationRuleResponse[]> {
    return this.http.get<EscalationRuleResponse[]>(`${this.apiUrl}/escalation-rules`);
  }

  getById(id: string): Observable<EscalationRuleResponse> {
    return this.http.get<EscalationRuleResponse>(`${this.apiUrl}/escalation-rules/${id}`);
  }

  create(request: CreateEscalationRuleRequest): Observable<EscalationRuleResponse> {
    return this.http.post<EscalationRuleResponse>(`${this.apiUrl}/escalation-rules`, request);
  }

  update(id: string, request: UpdateEscalationRuleRequest): Observable<EscalationRuleResponse> {
    return this.http.put<EscalationRuleResponse>(`${this.apiUrl}/escalation-rules/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/escalation-rules/${id}`);
  }
}
