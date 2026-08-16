import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const setAuth = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const { accessToken, refreshToken } = await login({ email, password })
      setAuth(accessToken, refreshToken)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password.')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1920&auto=format&fit=crop"
        alt="Hospital"
        className="absolute inset-0 w-full h-full object-cover brightness-110"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-teal-950/60 via-transparent to-teal-900/20" />

      {/* Centered content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-slate-700/50 w-full max-w-sm space-y-4"
        >
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">Private Hospital System</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to your account</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="name@hospital.pt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/50 border border-red-800/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg px-3 py-2.5 transition-colors"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  )
}