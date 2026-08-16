import { create } from 'zustand'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  role: string | null
  fullName: string | null
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string) => void
  logout: () => void
}

function decodeToken(token: string) {
  const payload = JSON.parse(atob(token.split('.')[1]))
  return {
    role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
    fullName: payload['fullName'],
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  role: localStorage.getItem('accessToken')
    ? decodeToken(localStorage.getItem('accessToken')!).role
    : null,
  fullName: localStorage.getItem('accessToken')
    ? decodeToken(localStorage.getItem('accessToken')!).fullName
    : null,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    const { role, fullName } = decodeToken(accessToken)
    set({ accessToken, refreshToken, role, fullName, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ accessToken: null, refreshToken: null, role: null, fullName: null, isAuthenticated: false })
  },
}))