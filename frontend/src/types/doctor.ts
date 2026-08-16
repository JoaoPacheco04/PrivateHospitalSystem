export interface Doctor {
  id: string
  fullName: string
  licenseNumber: string
  phoneNumber: string
  email: string | null
  isActive: boolean
  specialties: string[]
  createdAt: string
}

export interface CreateDoctorDto {
  fullName: string
  licenseNumber: string
  phoneNumber: string
  email?: string
}