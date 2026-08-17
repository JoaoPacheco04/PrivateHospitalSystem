import { apiClient } from './client'
import type { Patient, CreatePatientDto, PagedResult } from '../types/patient'

export async function getPatients(page = 1, pageSize = 20): Promise<PagedResult<Patient>> {
  const response = await apiClient.get<PagedResult<Patient>>('/Patients', {
    params: { page, pageSize },
  })
  return response.data
}

export async function getPatient(id: string): Promise<Patient> {
  const response = await apiClient.get<Patient>(`/Patients/${id}`)
  return response.data
}

export async function getMyProfile(): Promise<Patient> {
  const response = await apiClient.get<Patient>('/Patients/me')
  return response.data
}

export async function createPatient(dto: CreatePatientDto): Promise<Patient> {
  const response = await apiClient.post<Patient>('/Patients', dto)
  return response.data
}

export async function updatePatient(id: string, dto: CreatePatientDto): Promise<void> {
  await apiClient.put(`/Patients/${id}`, dto)
}

export async function deletePatient(id: string): Promise<void> {
  await apiClient.delete(`/Patients/${id}`)
}