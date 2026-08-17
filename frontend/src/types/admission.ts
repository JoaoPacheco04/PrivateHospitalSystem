export interface Admission {
  id: string
  patientId: string
  patientName: string
  patientNumber?: string
  bedId: string
  bedNumber: string
  department?: string
  roomNumber?: string
  admittedAt: string
  admissionDate?: string
  dischargedAt: string | null
  reason: string | null
}

export interface CreateAdmissionDto {
  patientId: string
  bedId: string
  reason?: string
}