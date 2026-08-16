export interface Bed {
  id: string
  bedNumber: string
  department: string
  status: string
  createdAt: string
}

export interface CreateBedDto {
  bedNumber: string
  department: string
}