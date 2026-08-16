export interface Patient {
  id: string
  patientNumber: string
  fullName: string
  dateOfBirth: string
  gender: string
  phoneNumber: string
  email: string | null
  address: string
  nif: string | null
  healthNumber: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  allergies: string | null
  medicalNotes: string | null
  insuranceProviderId: string | null
  insuranceProviderName: string | null
  policyNumber: string | null
  createdAt: string
}

export interface CreatePatientDto {
  fullName: string
  dateOfBirth: string
  gender: string
  phoneNumber: string
  email?: string
  address: string
  nif?: string
  healthNumber?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  allergies?: string
  medicalNotes?: string
  insuranceProviderId?: string
  policyNumber?: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}