import { apiClient } from './client'
import type { AuditLogItem } from '../types/auditLog'

export async function getAuditLogs(count: number = 50): Promise<AuditLogItem[]> {
  const response = await apiClient.get<AuditLogItem[]>(`/AuditLogs?count=${count}`)
  return response.data
}
