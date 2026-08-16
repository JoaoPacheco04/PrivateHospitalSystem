import { apiClient } from './client'
import type { MedicalExam, CreateMedicalExamDto } from '../types/medicalExam'

export async function getExamsByPatient(patientId: string): Promise<MedicalExam[]> {
  const response = await apiClient.get<MedicalExam[]>(`/MedicalExams/patient/${patientId}`)
  return response.data
}

export async function createMedicalExam(dto: CreateMedicalExamDto): Promise<MedicalExam> {
  const response = await apiClient.post<MedicalExam>('/MedicalExams', dto)
  return response.data
}

export async function completeMedicalExam(id: string, result: string): Promise<void> {
  await apiClient.patch(`/MedicalExams/${id}/complete`, JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
}