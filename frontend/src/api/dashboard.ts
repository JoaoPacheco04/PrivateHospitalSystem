import { apiClient } from './client'
import type { DashboardData } from '../types/dashboard'

export async function getDashboard(): Promise<DashboardData> {
  const response = await apiClient.get<DashboardData>('/Dashboard')
  return response.data
}