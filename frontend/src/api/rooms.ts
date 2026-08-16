import { apiClient } from './client'
import type { Room } from '../types/room'

export async function getRooms(): Promise<Room[]> {
  const response = await apiClient.get<Room[]>('/Rooms')
  return response.data
}

export async function createRoom(dto: { roomNumber: string; department?: string }): Promise<Room> {
  const response = await apiClient.post<Room>('/Rooms', dto)
  return response.data
}