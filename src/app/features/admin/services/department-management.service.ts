import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DepartmentFilterRequest {
  parentDepartmentId?: number;
  isActive?: boolean;
  search?: string;
}

export interface DepartmentResponse {
  departmentId: number;
  parentDepartmentId?: number;
  parentDepartmentName?: string;
  departmentCode: string;
  departmentName: string;
  managerId?: string;
  managerFullName?: string;
  managerEmail?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  childDepartments: DepartmentResponse[];
}

export interface CreateDepartmentRequest {
  parentDepartmentId?: number;
  departmentCode: string;
  departmentName: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export interface UpdateDepartmentRequest extends CreateDepartmentRequest {}

export interface AssignDepartmentMemberRequest {
  userId: string;
  jobTitle?: string;
  isManager: boolean;
}

export interface DepartmentMemberResponse {
  departmentId: number;
  userId: string;
  fullName: string;
  email?: string;
  jobTitle?: string;
  isManager: boolean;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class DepartmentManagementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/departments`;

  getDepartments(filter?: DepartmentFilterRequest): Observable<DepartmentResponse[]> {
    let params = new HttpParams();
    if (filter) {
      if (filter.parentDepartmentId !== undefined) params = params.set('parentDepartmentId', filter.parentDepartmentId.toString());
      if (filter.isActive !== undefined) params = params.set('isActive', filter.isActive.toString());
      if (filter.search) params = params.set('search', filter.search);
    }
    return this.http.get<DepartmentResponse[]>(this.baseUrl, { params });
  }

  getDepartment(id: number): Observable<DepartmentResponse> {
    return this.http.get<DepartmentResponse>(`${this.baseUrl}/${id}`);
  }

  createDepartment(request: CreateDepartmentRequest): Observable<DepartmentResponse> {
    return this.http.post<DepartmentResponse>(this.baseUrl, request);
  }

  updateDepartment(id: number, request: UpdateDepartmentRequest): Observable<DepartmentResponse> {
    return this.http.put<DepartmentResponse>(`${this.baseUrl}/${id}`, request);
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getDepartmentMembers(id: number, activeOnly = true): Observable<DepartmentMemberResponse[]> {
    return this.http.get<DepartmentMemberResponse[]>(`${this.baseUrl}/${id}/members`, {
      params: new HttpParams().set('activeOnly', activeOnly.toString())
    });
  }

  assignMember(id: number, request: AssignDepartmentMemberRequest): Observable<DepartmentMemberResponse> {
    return this.http.post<DepartmentMemberResponse>(`${this.baseUrl}/${id}/members`, request);
  }
}
