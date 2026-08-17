import { create } from 'zustand'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  role: string | null
  fullName: string | null
  patientId: string | null
  doctorId: string | null
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string) => void
  logout: () => void
}

function decodeToken(token: string) {
  const payload = JSON.parse(atob(token.split('.')[1]))
  return {
    role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] as string | null,
    fullName: payload['fullName'] as string | null,
    patientId: payload['patientId'] as string | null ?? null,
    doctorId: payload['doctorId'] as string | null ?? null,
  }
}

function initFromToken(token: string | null) {
  if (!token) return { role: null, fullName: null, patientId: null, doctorId: null }
  return decodeToken(token)
}

const stored = initFromToken(localStorage.getItem('accessToken'))

export const useAuthStore = create<AuthState>(() => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  role: stored.role,
  fullName: stored.fullName,
  patientId: stored.patientId,
  doctorId: stored.doctorId,
  isAuthenticated: !!localStorage.getItem('accessToken'),

  login: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    const { role, fullName, patientId, doctorId } = decodeToken(accessToken)
    useAuthStore.setState({ accessToken, refreshToken, role, fullName, patientId, doctorId, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    useAuthStore.setState({
      accessToken: null, refreshToken: null,
      role: null, fullName: null, patientId: null, doctorId: null,
      isAuthenticated: false,
    })
  },
}))