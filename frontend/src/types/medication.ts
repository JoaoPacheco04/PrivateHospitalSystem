export interface Medication {
  id: string
  name: string
  stockQuantity: number
  minimumStockAlert: number
  isLowStock: boolean
  batchNumber?: string
  expiryDate?: string
}

export interface CreateMedicationDto {
  name: string
  stockQuantity: number
  minimumStockAlert: number
  batchNumber?: string
  expiryDate?: string
}