import { apiClient } from './client'
import type { Admission, CreateAdmissionDto } from '../types/admission'

export async function getActiveAdmissions(): Promise<Admission[]> {
  const response = await apiClient.get<Admission[]>('/Admissions/active')
  return response.data
}

export async function createAdmission(dto: CreateAdmissionDto): Promise<Admission> {
  const response = await apiClient.post<Admission>('/Admissions', dto)
  return response.data
}

export async function dischargeAdmission(id: string): Promise<void> {
  await apiClient.patch(`/Admissions/${id}/discharge`)
}