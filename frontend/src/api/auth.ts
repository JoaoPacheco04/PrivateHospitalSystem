import { apiClient } from './client'

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/Auth/login', dto)
  return response.data
}