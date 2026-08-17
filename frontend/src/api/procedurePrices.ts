import { apiClient } from './client'
import type { ProcedurePrice } from '../types/procedurePrice'

export interface CreateProcedurePriceDto {
  procedureType: string
  price: number
}

export async function getProcedurePrices(): Promise<ProcedurePrice[]> {
  const response = await apiClient.get<ProcedurePrice[]>('/ProcedurePrices')
  return response.data
}

export async function createProcedurePrice(dto: CreateProcedurePriceDto): Promise<ProcedurePrice> {
  const response = await apiClient.post<ProcedurePrice>('/ProcedurePrices', dto)
  return response.data
}

export async function updateProcedurePrice(id: string, dto: CreateProcedurePriceDto): Promise<void> {
  await apiClient.put(`/ProcedurePrices/${id}`, dto)
}