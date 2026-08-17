export interface InsuranceProvider {
  id: string
  name: string
  contactEmail?: string
  contactPhone?: string
}

export interface CreateInsuranceProviderDto {
  name: string
  contactEmail?: string
  contactPhone?: string
}

export interface InsuranceCoverage {
  id: string
  insuranceProviderId: string
  procedureType: string
  coveragePercentage: number
}

export interface CreateInsuranceCoverageDto {
  insuranceProviderId: string
  procedureType: string
  coveragePercentage: number
}