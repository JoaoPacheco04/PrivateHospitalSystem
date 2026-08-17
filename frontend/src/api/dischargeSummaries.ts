import { apiClient } from './client'
import type { DischargeSummary, CreateDischargeSummaryDto } from '../types/dischargeSummary'

export async function getDischargeSummaryByAdmission(admissionId: string): Promise<DischargeSummary | null> {
  try {
    const response = await apiClient.get<DischargeSummary>(`/DischargeSummaries/admission/${admissionId}`)
    return response.data
  } catch {
    return null
  }
}

export async function createDischargeSummary(dto: CreateDischargeSummaryDto): Promise<DischargeSummary> {
  const response = await apiClient.post<DischargeSummary>('/DischargeSummaries', dto)
  return response.data
}
