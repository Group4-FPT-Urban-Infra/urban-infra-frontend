import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { Observable, catchError, of, switchMap, timer } from 'rxjs'
import { env } from '../../core/config/env'
import type { Incident } from './public-map.types'

/**
 * Khoảng thời gian giữa 2 lần gọi API lấy danh sách sự cố (ms).
 *
 * Vì sao dùng POLLING thay vì WebSocket:
 * - Sự cố hạ tầng (ổ gà, đèn hỏng, ngập nước...) không phát sinh liên tục theo
 *   giây như dữ liệu chứng khoán/định vị xe, nên độ trễ 15-30s là chấp nhận được.
 * - Polling dùng lại nguyên vẹn HttpClient + interceptor (auth, error handling)
 *   đã có sẵn trong dự án — không cần thêm hub/connection riêng ở backend.
 * - Đơn giản hơn nhiều để build, test và deploy (nginx proxy /api thuần HTTP,
 *   không cần cấu hình sticky session hay proxy WebSocket).
 * Khi nào nên đổi sang WebSocket (SignalR): nếu sau này cần cập nhật realtime
 * thực sự (vd. theo dõi vị trí đội xử lý sự cố di chuyển trên bản đồ), hoặc số
 * lượng client lớn khiến polling gây tải không cần thiết cho backend.
 */
const POLL_INTERVAL_MS = 15_000

@Injectable({ providedIn: 'root' })
export class PublicMapService {
  private readonly http = inject(HttpClient)

  /**
   * Stream danh sách sự cố, tự động gọi lại API mỗi POLL_INTERVAL_MS.
   * Component chỉ cần subscribe (qua toSignal) — không cần biết cơ chế lấy dữ
   * liệu bên dưới là polling hay (sau này) WebSocket, nên đổi phương án không
   * ảnh hưởng đến UI.
   */
  readonly incidents$: Observable<Incident[]> = timer(0, POLL_INTERVAL_MS).pipe(
    switchMap(() => this.fetchIncidents()),
  )

  private fetchIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${env.apiBaseUrl}/incidents`).pipe(
      // Backend UrbanInfraSystem chưa có endpoint /incidents -> tạm fallback dữ
      // liệu mẫu để màn hình chạy được ngay. Xóa catchError này khi API thật sẵn sàng.
      catchError(() => of(MOCK_INCIDENTS)),
    )
  }
}

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 1,
    title: 'Ổ gà lớn trên đường Giải Phóng',
    category: 'Mặt đường',
    status: 'new',
    severity: 'high',
    lat: 21.003,
    lng: 105.841,
    reportedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Đèn chiếu sáng bị hỏng',
    category: 'Chiếu sáng',
    status: 'in_progress',
    severity: 'medium',
    lat: 21.028,
    lng: 105.854,
    reportedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Ngập nước sau mưa',
    category: 'Thoát nước',
    status: 'resolved',
    severity: 'low',
    lat: 21.017,
    lng: 105.803,
    reportedAt: new Date().toISOString(),
  },
]
