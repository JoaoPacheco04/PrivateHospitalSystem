import { apiClient } from './client'
import type { Referral, CreateReferralDto } from '../types/referral'

export async function getReferralsByPatient(patientId: string): Promise<Referral[]> {
  const response = await apiClient.get<Referral[]>(`/Referrals/patient/${patientId}`)
  return response.data
}

export async function createReferral(dto: CreateReferralDto): Promise<Referral> {
  const response = await apiClient.post<Referral>('/Referrals', dto)
  return response.data
}

export async function updateReferralStatus(id: string, status: string): Promise<void> {
  await apiClient.patch(`/Referrals/${id}/status`, { status })
}