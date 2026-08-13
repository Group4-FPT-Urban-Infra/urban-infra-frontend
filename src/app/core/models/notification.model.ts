export interface NotificationItem {
  id: number
  userId: string
  title: string
  message: string
  notificationType: string
  issueId?: number | null
  isRead: boolean
  createdAt: string
  readAt?: string | null
}

export interface CreateNotificationPayload {
  userId: string
  title: string
  message: string
  notificationType?: string
  issueId?: number
}
