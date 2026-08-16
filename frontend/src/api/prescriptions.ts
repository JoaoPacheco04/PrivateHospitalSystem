import { apiClient } from './client'
import type { Prescription, CreatePrescriptionDto } from '../types/prescription'

export async function getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
  const response = await apiClient.get<Prescription[]>(`/Prescriptions/patient/${patientId}`)
  return response.data
}

export async function createPrescription(dto: CreatePrescriptionDto): Promise<Prescription> {
  const response = await apiClient.post<Prescription>('/Prescriptions', dto)
  return response.data
}