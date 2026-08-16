export interface MedicalExam {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  examType: string
  status: string
  result: string | null
  requestedAt: string
  completedAt: string | null
}

export interface CreateMedicalExamDto {
  patientId: string
  doctorId: string
  examType: string
}