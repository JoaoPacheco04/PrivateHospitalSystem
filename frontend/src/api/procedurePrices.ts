import { apiClient } from './client'
import type { ProcedurePrice } from '../types/procedurePrice'

export async function getProcedurePrices(): Promise<ProcedurePrice[]> {
  const response = await apiClient.get<ProcedurePrice[]>('/ProcedurePrices')
  return response.data
}