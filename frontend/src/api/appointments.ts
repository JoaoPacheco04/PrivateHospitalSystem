import { apiClient } from './client'
import type { Appointment, CreateAppointmentDto } from '../types/appointment'

export async function getAppointments(): Promise<Appointment[]> {
  const response = await apiClient.get<Appointment[]>('/Appointments')
  return response.data
}

export async function createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
  const response = await apiClient.post<Appointment>('/Appointments', dto)
  return response.data
}

export async function cancelAppointment(id: string): Promise<void> {
  await apiClient.patch(`/Appointments/${id}/cancel`)
}