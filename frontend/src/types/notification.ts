export interface NotificationItem {
  id: string
  userId?: string
  patientId?: string
  doctorId?: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export interface CreateNotificationDto {
  patientId?: string
  doctorId?: string
  title: string
  message: string
  type: string
}
