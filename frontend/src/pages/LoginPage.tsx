import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { login, register } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { defaultRouteForRole } from '../lib/permissions'

type Mode = 'login' | 'register'

const ROLES = ['Admin', 'Staff', 'Doctor', 'Patient'] as const

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')

  // Login fields
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  // Register extra fields
  const [fullName, setFullName]     = useState('')
  const [regEmail, setRegEmail]     = useState('')
  const [regPass, setRegPass]       = useState('')
  const [role, setRole]             = useState<string>('Patient')

  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const setAuth  = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
    setSuccess(null)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { accessToken, refreshToken } = await login({ email, password })
      setAuth(accessToken, refreshToken)
      navigate(defaultRouteForRole(useAuthStore.getState().role))
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError('Cannot connect to the server. Make sure the backend is running on https://localhost:7183.')
        } else if (err.response.status === 401) {
          setError('Incorrect email or password.')
        } else {
          setError(`Server error: ${err.response.status} — ${err.response.data ?? 'Unknown error'}`)
        }
      } else {
        setError('Unexpected error. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register({ fullName, email: regEmail, password: regPass, role })
      setSuccess('Account created! You can now sign in.')
      setMode('login')
      setEmail(regEmail)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError('Cannot connect to the server. Make sure the backend is running.')
        } else {
          const msg = typeof err.response.data === 'string'
            ? err.response.data
            : JSON.stringify(err.response.data)
          setError(msg || 'Failed to create account.')
        }
      } else {
        setError('Unexpected error. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Shared input style ────────────────────────────────────
  const inputCls = [
    'w-full bg-slate-800 border border-slate-700/80',
    'text-slate-100 placeholder-slate-500 text-sm rounded-xl',
    'py-3 transition-colors outline-none',
    'focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20',
  ].join(' ')

  const EyeIcon = showPass ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )

  return (
    <div className="min-h-screen flex">

      {/* ── Left — image panel ─────────────────────────────── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden flex-col justify-between p-12">
        <img
          src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1920&auto=format&fit=crop"
          alt="Hospital"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.35) saturate(0.65)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/60 via-transparent to-teal-950/50" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Private Hospital</p>
            <p className="text-slate-400 text-xs mt-0.5">Clinical System</p>
          </div>
        </div>

        {/* Quote */}
        <div className="relative">
          <p className="text-white/80 text-xl font-light leading-relaxed italic mb-4">
            "Caring for patients with expertise,<br />compassion, and precision."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-0.5 bg-teal-500/70 rounded" />
            <span className="text-teal-400/70 text-sm">Private Hospital System</span>
          </div>
        </div>
      </div>

      {/* ── Right — form panel ─────────────────────────────── */}
      <div className="w-full lg:w-[460px] shrink-0 flex items-center justify-center bg-slate-950 px-8 py-12 border-l border-slate-800/50">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-white font-bold">Private Hospital</span>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 mb-8">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={[
                  'flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all',
                  mode === m
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200',
                ].join(' ')}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {mode === 'login'
                ? 'Enter your credentials to continue'
                : 'Fill in your details to get started'}
            </p>
          </div>

          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm mb-5">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
          )}

          {/* ── LOGIN form ─────────────────────────────────── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  id="email" type="email" placeholder="name@hospital.pt"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required autoComplete="email"
                  className={`${inputCls} px-4`}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required autoComplete="current-password"
                    className={`${inputCls} px-4 pr-11`}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    {EyeIcon}
                  </button>
                </div>
              </div>

              {error && <ErrorMsg msg={error} />}

              <SubmitBtn loading={loading} label="Sign in" />
            </form>
          )}

          {/* ── REGISTER form ──────────────────────────────── */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
                <input
                  id="fullName" type="text" placeholder="João Silva"
                  value={fullName} onChange={(e) => setFullName(e.target.value)}
                  required autoComplete="name"
                  className={`${inputCls} px-4`}
                />
              </div>

              <div>
                <label htmlFor="regEmail" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  id="regEmail" type="email" placeholder="name@hospital.pt"
                  value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                  required autoComplete="email"
                  className={`${inputCls} px-4`}
                />
              </div>

              <div>
                <label htmlFor="regPass" className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    id="regPass" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                    value={regPass} onChange={(e) => setRegPass(e.target.value)}
                    required minLength={6} autoComplete="new-password"
                    className={`${inputCls} px-4 pr-11`}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                    {EyeIcon}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={[
                        'py-2.5 rounded-xl text-sm font-medium border transition-all',
                        role === r
                          ? 'bg-teal-600 border-teal-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200',
                      ].join(' ')}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {error && <ErrorMsg msg={error} />}

              <SubmitBtn loading={loading} label="Create account" />
            </form>
          )}

          <p className="text-center text-xs text-slate-700 mt-8">
            Private Hospital System · v1.0
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────
function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      {msg}
    </div>
  )
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors shadow-lg shadow-teal-900/20 mt-1"
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Please wait...
        </>
      ) : (
        <>
          {label}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </>
      )}
    </button>
  )
}