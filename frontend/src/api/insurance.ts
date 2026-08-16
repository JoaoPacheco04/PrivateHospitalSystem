import { apiClient } from './client'
import type { InsuranceProvider } from '../types/insurance'

export async function getInsuranceProviders(): Promise<InsuranceProvider[]> {
  const response = await apiClient.get<InsuranceProvider[]>('/InsuranceProviders')
  return response.data
}