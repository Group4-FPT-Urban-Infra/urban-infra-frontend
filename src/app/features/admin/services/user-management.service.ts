import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AdminUserResponse {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  roles: string[];
  departmentId?: number;
  isActive: boolean;
  createdAtUtc: string;
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

export interface AdminUserListRequest {
  role?: string;
  isActive?: boolean;
  keyword?: string;
  departmentId?: number;
  page: number;
  pageSize: number;
}

export interface CreateUserByAdminRequest {
  email: string;
  password?: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  departmentId?: number;
}

export interface UpdateUserByAdminRequest {
  fullName: string;
  phoneNumber?: string;
  role: string;
  departmentId?: number;
}

export interface DepartmentResponse {
  departmentId: number;
  parentDepartmentId?: number;
  parentDepartmentName?: string;
  departmentCode: string;
  departmentName: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  childDepartments: DepartmentResponse[];
}

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin/users`;
  private readonly deptUrl = `${environment.apiBaseUrl}/departments`;

  getUsers(request: AdminUserListRequest): Observable<PagedResult<AdminUserResponse>> {
    let params = new HttpParams()
      .set('page', request.page)
      .set('pageSize', request.pageSize);
      
    if (request.role) params = params.set('role', request.role);
    if (request.isActive !== undefined && request.isActive !== null) {
      params = params.set('isActive', request.isActive);
    }
    if (request.keyword) params = params.set('keyword', request.keyword);
    if (request.departmentId) params = params.set('departmentId', request.departmentId);

    return this.http.get<PagedResult<AdminUserResponse>>(this.baseUrl, { params });
  }

  createUser(request: CreateUserByAdminRequest): Observable<string> {
    return this.http.post<string>(this.baseUrl, request);
  }

  updateUser(id: string, request: UpdateUserByAdminRequest): Observable<AdminUserResponse> {
    return this.http.put<AdminUserResponse>(`${this.baseUrl}/${id}`, request);
  }

  setUserStatus(id: string, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/status`, null, {
      params: new HttpParams().set('isActive', isActive)
    });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getDepartments(): Observable<DepartmentResponse[]> {
    return this.http.get<DepartmentResponse[]>(this.deptUrl);
  }
}
