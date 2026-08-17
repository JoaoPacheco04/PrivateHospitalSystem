import { apiClient } from './client'
import type {
  InsuranceProvider,
  CreateInsuranceProviderDto,
  InsuranceCoverage,
  CreateInsuranceCoverageDto,
} from '../types/insurance'

export async function getInsuranceProviders(): Promise<InsuranceProvider[]> {
  const response = await apiClient.get<InsuranceProvider[]>('/InsuranceProviders')
  return response.data
}

export async function createInsuranceProvider(dto: CreateInsuranceProviderDto): Promise<InsuranceProvider> {
  const response = await apiClient.post<InsuranceProvider>('/InsuranceProviders', dto)
  return response.data
}

export async function deleteInsuranceProvider(id: string): Promise<void> {
  await apiClient.delete(`/InsuranceProviders/${id}`)
}

export async function getInsuranceCoverages(): Promise<InsuranceCoverage[]> {
  const response = await apiClient.get<InsuranceCoverage[]>('/InsuranceCoverages')
  return response.data
}

export async function createInsuranceCoverage(dto: CreateInsuranceCoverageDto): Promise<InsuranceCoverage> {
  const response = await apiClient.post<InsuranceCoverage>('/InsuranceCoverages', dto)
  return response.data
}

export async function deleteInsuranceCoverage(id: string): Promise<void> {
  await apiClient.delete(`/InsuranceCoverages/${id}`)
}