import { apiClient } from './client'
import type { NotificationItem, CreateNotificationDto } from '../types/notification'

export async function getAdminNotifications(): Promise<NotificationItem[]> {
  const response = await apiClient.get<NotificationItem[]>('/Notifications/admin')
  return response.data
}

export async function getDoctorNotifications(doctorId: string): Promise<NotificationItem[]> {
  const response = await apiClient.get<NotificationItem[]>(`/Notifications/doctor/${doctorId}`)
  return response.data
}

export async function getPatientNotifications(patientId: string): Promise<NotificationItem[]> {
  const response = await apiClient.get<NotificationItem[]>(`/Notifications/patient/${patientId}`)
  return response.data
}

export async function createNotification(dto: CreateNotificationDto): Promise<NotificationItem> {
  const response = await apiClient.post<NotificationItem>('/Notifications', dto)
  return response.data
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await apiClient.patch(`/Notifications/${id}/read`)
}
