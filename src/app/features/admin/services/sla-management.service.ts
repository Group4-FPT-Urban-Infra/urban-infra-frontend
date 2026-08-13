import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SlaPolicyResponse {
  id: string;
  issueTypeId: number;
  issueTypeName: string;
  priorityId: number;
  priorityName: string;
  resolutionMinutes: number;
  firstResponseMinutes: number;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export interface CreateSlaPolicyRequest {
  issueTypeId: number;
  priorityId: number;
  resolutionMinutes: number;
  firstResponseMinutes: number;
}

export interface UpdateSlaPolicyRequest {
  issueTypeId: number;
  priorityId: number;
  resolutionMinutes: number;
  firstResponseMinutes: number;
}

export interface IssueTypeLookupResponse {
  issueTypeId: number;
  parentIssueTypeId?: number;
  typeCode: string;
  typeName: string;
  iconUrl?: string;
  description?: string;
}

export interface IssuePriorityResponse {
  priorityId: number;
  priorityCode: string;
  priorityName: string;
  severityRank: number;
  isActive: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SlaManagementService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  getSlaPolicies(page: number = 1, pageSize: number = 20, keyword?: string, priorityId?: number): Observable<PagedResult<SlaPolicyResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (priorityId) {
      params = params.set('priorityId', priorityId.toString());
    }

    return this.http.get<PagedResult<SlaPolicyResponse>>(`${this.apiUrl}/sla-policies`, { params });
  }

  createSlaPolicy(request: CreateSlaPolicyRequest): Observable<SlaPolicyResponse> {
    return this.http.post<SlaPolicyResponse>(`${this.apiUrl}/sla-policies`, request);
  }

  updateSlaPolicy(id: string, request: UpdateSlaPolicyRequest): Observable<SlaPolicyResponse> {
    return this.http.put<SlaPolicyResponse>(`${this.apiUrl}/sla-policies/${id}`, request);
  }

  deleteSlaPolicy(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sla-policies/${id}`);
  }

  getIssueTypes(): Observable<IssueTypeLookupResponse[]> {
    return this.http.get<IssueTypeLookupResponse[]>(`${this.apiUrl}/issue-types`);
  }

  getIssuePriorities(): Observable<IssuePriorityResponse[]> {
    return this.http.get<IssuePriorityResponse[]>(`${this.apiUrl}/issue-priorities`);
  }
}
