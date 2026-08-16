export interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  appointmentId: string | null
  medicationName: string
  dosage: string
  instructions: string
  prescribedAt: string
}

export interface CreatePrescriptionDto {
  patientId: string
  doctorId: string
  appointmentId?: string
  medicationName: string
  dosage: string
  instructions: string
}