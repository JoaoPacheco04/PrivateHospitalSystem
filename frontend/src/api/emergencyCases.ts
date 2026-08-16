import { apiClient } from './client'
import type { EmergencyCase, CreateEmergencyCaseDto, CompleteEmergencyCaseDto } from '../types/emergencyCase'

export async function getEmergencyQueue(): Promise<EmergencyCase[]> {
  const response = await apiClient.get<EmergencyCase[]>('/EmergencyCases/queue')
  return response.data
}

export async function createEmergencyCase(dto: CreateEmergencyCaseDto): Promise<EmergencyCase> {
  const response = await apiClient.post<EmergencyCase>('/EmergencyCases', dto)
  return response.data
}

export async function startEmergencyCase(id: string, doctorId: string): Promise<void> {
  await apiClient.patch(`/EmergencyCases/${id}/start`, JSON.stringify(doctorId), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function completeEmergencyCase(id: string, dto: CompleteEmergencyCaseDto): Promise<void> {
  await apiClient.patch(`/EmergencyCases/${id}/complete`, dto)
}