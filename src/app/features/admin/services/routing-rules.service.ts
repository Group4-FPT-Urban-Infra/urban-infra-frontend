import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CreateRoutingRuleRequest {
  issueTypeId: number;
  areaId: number;
  departmentId: number;
  isActive: boolean;
}

export interface RoutingRuleResponse {
  routingRuleId: number;
  issueTypeId: number;
  issueTypeCode: string;
  issueTypeName: string;
  areaId: number;
  areaCode: string;
  areaName: string;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface RoutingRuleFilterRequest {
  issueTypeId?: number;
  areaId?: number;
  departmentId?: number;
  includeInactive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class RoutingRulesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/routing-rules`;

  getAll(filter?: RoutingRuleFilterRequest): Observable<RoutingRuleResponse[]> {
    let params = new HttpParams();
    if (filter) {
      if (filter.issueTypeId) params = params.set('issueTypeId', filter.issueTypeId.toString());
      if (filter.areaId) params = params.set('areaId', filter.areaId.toString());
      if (filter.departmentId) params = params.set('departmentId', filter.departmentId.toString());
      if (filter.includeInactive !== undefined) params = params.set('includeInactive', filter.includeInactive.toString());
    }
    return this.http.get<RoutingRuleResponse[]>(this.baseUrl, { params });
  }

  create(request: CreateRoutingRuleRequest): Observable<RoutingRuleResponse> {
    return this.http.post<RoutingRuleResponse>(this.baseUrl, request);
  }
}
