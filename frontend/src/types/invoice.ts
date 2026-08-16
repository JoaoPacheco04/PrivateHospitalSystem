export interface Invoice {
  id: string
  patientId: string
  patientName: string
  procedureType: string
  totalAmount: number
  insuranceCoveredAmount: number
  patientAmount: number
  status: string
  issuedAt: string
  paidAt: string | null
}

export interface CreateInvoiceDto {
  patientId: string
  procedureType: string
}