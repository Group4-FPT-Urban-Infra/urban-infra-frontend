import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface IssueTypeSummary {
  issueTypeId: number;
  typeCode: string;
  typeName: string;
  iconUrl?: string;
  slaPolicySummary?: string;
  isActive: boolean;
}

export interface IssueTypeResponse {
  issueTypeId: number;
  parentIssueTypeId?: number;
  typeCode: string;
  typeName: string;
  iconUrl?: string;
  description?: string;
  slaPolicySummary?: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  parentIssueType?: IssueTypeSummary;
  subIssueTypes: IssueTypeSummary[];
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface SearchIssueTypesRequest {
  parentIssueTypeId?: number;
  keyword?: string;
  isRootOnly?: boolean;
  isSubCategoryOnly?: boolean;
  isActiveOnly?: boolean;
  page?: number;
  pageSize?: number;
  sort?: string;
}

export interface CreateIssueTypeRequest {
  typeCode: string;
  typeName: string;
  parentIssueTypeId?: number;
  iconUrl?: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateIssueTypeRequest {
  typeCode?: string;
  typeName?: string;
  parentIssueTypeId?: number;
  iconUrl?: string;
  description?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class IncidentCategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/issue-types`;

  search(request: SearchIssueTypesRequest): Observable<ApiResponse<PagedResponse<IssueTypeResponse>>> {
    let params = new HttpParams();
    if (request.parentIssueTypeId !== undefined) params = params.set('parentIssueTypeId', request.parentIssueTypeId.toString());
    if (request.keyword) params = params.set('keyword', request.keyword);
    if (request.isRootOnly !== undefined) params = params.set('isRootOnly', request.isRootOnly.toString());
    if (request.isSubCategoryOnly !== undefined) params = params.set('isSubCategoryOnly', request.isSubCategoryOnly.toString());
    if (request.isActiveOnly !== undefined) params = params.set('isActiveOnly', request.isActiveOnly.toString());
    if (request.page !== undefined) params = params.set('page', request.page.toString());
    if (request.pageSize !== undefined) params = params.set('pageSize', request.pageSize.toString());
    if (request.sort) params = params.set('sort', request.sort);

    return this.http.get<ApiResponse<PagedResponse<IssueTypeResponse>>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<IssueTypeResponse>> {
    return this.http.get<ApiResponse<IssueTypeResponse>>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateIssueTypeRequest): Observable<ApiResponse<IssueTypeResponse>> {
    return this.http.post<ApiResponse<IssueTypeResponse>>(this.baseUrl, request);
  }

  update(id: number, request: UpdateIssueTypeRequest): Observable<ApiResponse<IssueTypeResponse>> {
    return this.http.put<ApiResponse<IssueTypeResponse>>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }
}
