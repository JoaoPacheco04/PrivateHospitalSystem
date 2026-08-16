export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  roomId: string
  roomNumber: string
  scheduledAt: string
  durationMinutes: number
  status: string
  notes: string | null
}

export interface CreateAppointmentDto {
  patientId: string
  doctorId: string
  roomId: string
  scheduledAt: string
  durationMinutes: number
  notes?: string
}