export interface Admission {
  id: string
  patientId: string
  patientName: string
  bedId: string
  bedNumber: string
  admittedAt: string
  dischargedAt: string | null
  reason: string | null
}

export interface CreateAdmissionDto {
  patientId: string
  bedId: string
  reason?: string
}