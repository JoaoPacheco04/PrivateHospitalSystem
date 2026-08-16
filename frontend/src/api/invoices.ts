import { apiClient } from './client'
import type { Invoice, CreateInvoiceDto } from '../types/invoice'

export async function getInvoicesByPatient(patientId: string): Promise<Invoice[]> {
  const response = await apiClient.get<Invoice[]>(`/Invoices/patient/${patientId}`)
  return response.data
}

export async function createInvoice(dto: CreateInvoiceDto): Promise<Invoice> {
  const response = await apiClient.post<Invoice>('/Invoices', dto)
  return response.data
}

export async function markInvoiceAsPaid(id: string): Promise<void> {
  await apiClient.patch(`/Invoices/${id}/pay`)
}