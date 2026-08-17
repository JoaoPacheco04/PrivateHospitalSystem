import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export default function InactivityLockModal() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const fullName = useAuthStore((s) => s.fullName)
  const logout = useAuthStore((s) => s.logout)

  const [isLocked, setIsLocked] = useState(false)
  const [countdown, setCountdown] = useState(60)

  // 15 minutes = 900_000 ms of inactivity
  const INACTIVITY_LIMIT = 15 * 60 * 1000

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLocked(false)
      return
    }

    let timer: NodeJS.Timeout

    const resetTimer = () => {
      if (isLocked) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        setIsLocked(true)
        setCountdown(60)
      }, INACTIVITY_LIMIT)
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach((evt) => window.addEventListener(evt, resetTimer))
    resetTimer()

    return () => {
      clearTimeout(timer)
      events.forEach((evt) => window.removeEventListener(evt, resetTimer))
    }
  }, [isAuthenticated, isLocked])

  // Countdown when locked
  useEffect(() => {
    if (!isLocked) return
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          logout()
          window.location.href = '/login'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isLocked, logout])

  if (!isLocked || !isAuthenticated) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl shadow-inner">
          🔒
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Session Security Lock</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Terminal locked due to 15 minutes of inactivity for GDPR / Clinical Compliance.
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-400">Authenticated Clinical User</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{fullName || 'Physician'}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-rose-600 font-semibold">Automatic logout in:</p>
          <p className="text-3xl font-mono font-black text-rose-600">{countdown}s</p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => setIsLocked(false)}
            className="btn-primary w-full py-3"
          >
            🔓 Unlock Session & Resume
          </button>
          <button
            onClick={() => {
              logout()
              window.location.href = '/login'
            }}
            className="text-xs text-slate-400 hover:text-rose-500 transition-colors py-1"
          >
            Sign out immediately
          </button>
        </div>
      </div>
    </div>
  )
}
