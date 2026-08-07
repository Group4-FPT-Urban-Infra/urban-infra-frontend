export type IncidentStatus = 'new' | 'in_progress' | 'resolved'
export type IncidentSeverity = 'low' | 'medium' | 'high'

/** Một sự cố hạ tầng (ổ gà, đèn hỏng, ngập nước...) hiển thị dưới dạng marker trên bản đồ. */
export interface Incident {
  id: number
  title: string
  category: string
  status: IncidentStatus
  severity: IncidentSeverity
  lat: number
  lng: number
  reportedAt: string
}
