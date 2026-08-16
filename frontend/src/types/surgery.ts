export interface Surgery {
  id: string
  patientId: string
  patientName: string
  roomId: string
  roomNumber: string
  procedureName: string
  scheduledAt: string
  durationMinutes: number
  status: string
  notes: string | null
  team: string[]
}

export interface CreateSurgeryDto {
  patientId: string
  roomId: string
  procedureName: string
  scheduledAt: string
  durationMinutes: number
  notes?: string
}

export interface AddSurgeryTeamMemberDto {
  doctorId: string
  role: string
}