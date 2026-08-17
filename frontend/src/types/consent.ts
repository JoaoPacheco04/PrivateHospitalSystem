export interface InformedConsent {
  id: string
  patientId: string
  patientName: string
  surgeryId?: string
  procedureDescription: string
  risksExplained: string
  patientSigned: boolean
  signedAt?: string
  witnessedByDoctorName: string
  createdAt: string
}

export interface CreateInformedConsentDto {
  patientId: string
  surgeryId?: string
  procedureDescription: string
  risksExplained: string
  witnessedByDoctorId: string
}
