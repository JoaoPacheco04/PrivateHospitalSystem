import { apiClient } from './client'
import type { Doctor, CreateDoctorDto } from '../types/doctor'

export async function getDoctors(): Promise<Doctor[]> {
  const response = await apiClient.get<Doctor[]>('/Doctors')
  return response.data
}

export async function getDoctor(id: string): Promise<Doctor> {
  const response = await apiClient.get<Doctor>(`/Doctors/${id}`)
  return response.data
}

export async function createDoctor(dto: CreateDoctorDto): Promise<Doctor> {
  const response = await apiClient.post<Doctor>('/Doctors', dto)
  return response.data
}

export async function updateDoctor(id: string, dto: CreateDoctorDto): Promise<void> {
  await apiClient.put(`/Doctors/${id}`, dto)
}

export async function deleteDoctor(id: string): Promise<void> {
  await apiClient.delete(`/Doctors/${id}`)
}