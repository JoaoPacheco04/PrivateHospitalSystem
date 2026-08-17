export interface AuditLogItem {
  id: string
  action: string
  entityName: string
  entityId?: string
  performedByName?: string
  details?: string
  timestamp: string
}
