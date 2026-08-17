import { apiClient } from './client'
import type { InformedConsent, CreateInformedConsentDto } from '../types/consent'

export async function getConsentsByPatient(patientId: string): Promise<InformedConsent[]> {
  const response = await apiClient.get<InformedConsent[]>(`/InformedConsents/patient/${patientId}`)
  return response.data
}

export async function createInformedConsent(dto: CreateInformedConsentDto): Promise<InformedConsent> {
  const response = await apiClient.post<InformedConsent>('/InformedConsents', dto)
  return response.data
}

export async function signConsent(id: string): Promise<void> {
  await apiClient.patch(`/InformedConsents/${id}/sign`)
}
