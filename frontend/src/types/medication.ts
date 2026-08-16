export interface Medication {
  id: string
  name: string
  stockQuantity: number
  minimumStockAlert: number
  isLowStock: boolean
}

export interface CreateMedicationDto {
  name: string
  stockQuantity: number
  minimumStockAlert: number
}