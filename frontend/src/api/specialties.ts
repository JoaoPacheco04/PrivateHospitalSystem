import { apiClient } from './client'
import type { Specialty } from '../types/specialty'

export async function getSpecialties(): Promise<Specialty[]> {
  const response = await apiClient.get<Specialty[]>('/Specialties')
  return response.data
}

export async function addDoctorSpecialty(doctorId: string, specialtyId: string): Promise<void> {
  await apiClient.post('/DoctorSpecialties', { doctorId, specialtyId })
}