import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { env } from '../../../core/config/env'
import { IssueSummaryResponse, PagedResponse } from '../../../core/services/dashboard.service'

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface KpiItem {
  value: number
  /** Phần trăm thay đổi so với tuần trước. null nếu không có dữ liệu so sánh. */
  trendPercent: number | null
  /** "up" | "down" | "stable" */
  trendDirection: 'up' | 'down' | 'stable'
}

export interface AdminKpiResponse {
  totalUsers: KpiItem
  openIncidents: KpiItem
  activeDepartments: KpiItem
  resolvedThisWeek: KpiItem
  newToday: KpiItem
  criticalIncidents: KpiItem
}

export interface TrendDataPoint {
  label: string
  value: number
}

export interface CategoryDistributionPoint {
  category: string
  count: number
  percentage: number
}

export interface HeatmapDataPoint {
  districtId: string
  districtName: string
  severity: string
  count: number
}

export type TrendPeriod = 'ThisWeek' | 'ThisMonth' | 'ThisYear'
export type HeatmapTimeframe = '24h' | '7d' | '30d'

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface AuditLogResponse {
  id: number
  title: string
  subtitle: string
  timestamp: string
  type: string
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly http = inject(HttpClient)
  private readonly base = `${env.apiBaseUrl}/dashboard`

  /**
   * GET /api/audit-logs
   * Trả về danh sách sự kiện hệ thống.
   */
  getSystemActivity(limit: number = 4): Observable<ApiResponse<AuditLogResponse[]>> {
    return this.http.get<ApiResponse<AuditLogResponse[]>>(
      `${env.apiBaseUrl}/audit-logs`,
      { params: { limit: limit.toString() } }
    )
  }

  /**
   * GET /api/dashboard/admin-kpis
   * Trả về 6 chỉ số KPI dành cho Admin Dashboard kèm trend % theo tuần.
   * Yêu cầu JWT với role Admin (auth interceptor tự động đính kèm token).
   */
  getAdminKpis(): Observable<ApiResponse<AdminKpiResponse>> {
    return this.http.get<ApiResponse<AdminKpiResponse>>(`${this.base}/admin-kpis`)
  }

  /**
   * GET /api/dashboard/incident-trends?period=ThisWeek|ThisMonth|ThisYear
   * Trả về mảng điểm dữ liệu cho biểu đồ xu hướng sự cố.
   */
  getIncidentTrends(period: TrendPeriod = 'ThisWeek'): Observable<ApiResponse<TrendDataPoint[]>> {
    return this.http.get<ApiResponse<TrendDataPoint[]>>(
      `${this.base}/incident-trends`,
      { params: { period } }
    )
  }

  /**
   * GET /api/dashboard/category-distribution
   * Trả về phân bổ sự cố theo danh mục (tỷ lệ phần trăm).
   */
  getCategoryDistribution(): Observable<ApiResponse<CategoryDistributionPoint[]>> {
    return this.http.get<ApiResponse<CategoryDistributionPoint[]>>(`${this.base}/category-distribution`)
  }

  /**
   * GET /api/dashboard/heatmap?timeframe=24h|7d|30d
   * Trả về dữ liệu heatmap các cụm sự cố.
   */
  getIncidentHeatmap(timeframe: HeatmapTimeframe = '7d'): Observable<ApiResponse<HeatmapDataPoint[]>> {
    return this.http.get<ApiResponse<HeatmapDataPoint[]>>(
      `${this.base}/heatmap`,
      { params: { timeframe } }
    )
  }

  /**
   * GET /api/issues
   * Trả về danh sách sự cố gần đây.
   */
  getRecentIssues(page: number = 1): Observable<ApiResponse<PagedResponse<IssueSummaryResponse>>> {
    const params = new HttpParams()
      .set('sort', 'reportedAtDesc')
      .set('page', page.toString())
      .set('pageSize', '8')

    return this.http.get<ApiResponse<PagedResponse<IssueSummaryResponse>>>(
      `${env.apiBaseUrl}/issues`,
      { params }
    )
  }

  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${env.apiBaseUrl}/departments`);
  }

  manualRoute(issueId: number, departmentId: number, note?: string): Observable<any> {
    return this.http.post<any>(`${env.apiBaseUrl}/issues/${issueId}/assignments/manual-route`, {
      departmentId,
      note
    });
  }
}

