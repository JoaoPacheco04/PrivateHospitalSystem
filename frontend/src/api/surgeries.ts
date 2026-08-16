import { apiClient } from './client'
import type { Surgery, CreateSurgeryDto, AddSurgeryTeamMemberDto } from '../types/surgery'

export async function getSurgeries(): Promise<Surgery[]> {
  const response = await apiClient.get<Surgery[]>('/Surgeries')
  return response.data
}

export async function createSurgery(dto: CreateSurgeryDto): Promise<Surgery> {
  const response = await apiClient.post<Surgery>('/Surgeries', dto)
  return response.data
}

export async function addSurgeryTeamMember(surgeryId: string, dto: AddSurgeryTeamMemberDto): Promise<void> {
  await apiClient.post(`/Surgeries/${surgeryId}/team`, dto)
}