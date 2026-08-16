export interface Referral {
  id: string
  patientId: string
  patientName: string
  referringDoctorId: string
  referringDoctorName: string
  referredToDoctorId: string
  referredToDoctorName: string
  reason: string
  notes: string | null
  isUrgent: boolean
  status: string
  createdAt: string
}

export interface CreateReferralDto {
  patientId: string
  referringDoctorId: string
  referredToDoctorId: string
  reason: string
  notes?: string
  isUrgent: boolean
}