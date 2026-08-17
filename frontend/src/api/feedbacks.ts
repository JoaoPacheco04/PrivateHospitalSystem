import { apiClient } from './client'

export interface CreateFeedbackDto {
  patientId: string
  appointmentId?: string
  admissionId?: string
  rating: number
  comment?: string
}

export interface FeedbackResponse {
  id: string
  patientId: string
  patientName: string
  rating: number
  comment?: string
  createdAt: string
}

export async function createPatientFeedback(dto: CreateFeedbackDto): Promise<FeedbackResponse> {
  const response = await apiClient.post<FeedbackResponse>('/PatientFeedbacks', dto)
  return response.data
}

export async function getAverageRating(): Promise<number> {
  const response = await apiClient.get<number>('/PatientFeedbacks/average-rating')
  return response.data
}
