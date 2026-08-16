import { apiClient } from './client'
import type { Bed, CreateBedDto } from '../types/bed'

export async function getBeds(): Promise<Bed[]> {
  const response = await apiClient.get<Bed[]>('/Beds')
  return response.data
}

export async function createBed(dto: CreateBedDto): Promise<Bed> {
  const response = await apiClient.post<Bed>('/Beds', dto)
  return response.data
}