import { apiClient } from './client'
import type { Medication, CreateMedicationDto } from '../types/medication'

export async function getMedications(): Promise<Medication[]> {
  const response = await apiClient.get<Medication[]>('/Medications')
  return response.data
}

export async function createMedication(dto: CreateMedicationDto): Promise<Medication> {
  const response = await apiClient.post<Medication>('/Medications', dto)
  return response.data
}

export async function restockMedication(id: string, quantity: number): Promise<void> {
  await apiClient.patch(`/Medications/${id}/restock`, JSON.stringify(quantity), {
    headers: { 'Content-Type': 'application/json' },
  })
}