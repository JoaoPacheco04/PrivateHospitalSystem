export interface EmergencyCase {
  id: string
  patientId: string
  patientName: string
  doctorId: string | null
  doctorName: string | null
  complaint: string
  priority: string
  status: string
  arrivedAt: string
  startedAt: string | null
  completedAt: string | null
}

export interface CreateEmergencyCaseDto {
  patientId: string
  complaint: string
  priority: number
}

export interface CompleteEmergencyCaseDto {
  requiresAdmission: boolean
  bedId?: string
  admissionReason?: string
}