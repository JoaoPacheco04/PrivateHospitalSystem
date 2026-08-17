export interface DischargeSummary {
  id: string
  admissionId: string
  patientName: string
  diagnosis: string
  treatmentSummary: string
  medicationOnDischarge?: string
  followUpDate?: string
  issuedByDoctorName: string
  issuedAt: string
}

export interface CreateDischargeSummaryDto {
  admissionId: string
  diagnosis: string
  treatmentSummary: string
  medicationOnDischarge?: string
  followUpDate?: string
  issuedByDoctorId: string
}
