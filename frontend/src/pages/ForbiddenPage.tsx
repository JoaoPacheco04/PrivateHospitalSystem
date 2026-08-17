import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { defaultRouteForRole } from '../lib/permissions'

export default function ForbiddenPage() {
  const role = useAuthStore((s) => s.role)
  const home = defaultRouteForRole(role)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center animate-fade-in">
        {/* Icon */}
        <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        {/* Status */}
        <p className="text-red-400 font-semibold text-sm tracking-widest uppercase mb-2">
          403 — Access Denied
        </p>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-3">
          You don't have permission
        </h1>
        <p className="text-slate-400 max-w-sm mx-auto mb-8">
          Your account doesn't have access to this page. Please contact an administrator if you believe this is a mistake.
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Link
            to={home}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg px-5 py-2.5 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg px-5 py-2.5 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
