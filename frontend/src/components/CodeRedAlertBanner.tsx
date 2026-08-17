import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getEmergencyQueue } from '../api/emergencyCases'
import { useAuthStore } from '../store/authStore'

export default function CodeRedAlertBanner() {
  const role = useAuthStore((s) => s.role)
  const isStaffOrDoctor = role === 'Admin' || role === 'Doctor' || role === 'Staff'
  const [dismissedId, setDismissedId] = useState<string | null>(null)

  const { data: queue } = useQuery({
    queryKey: ['emergencyQueue'],
    queryFn: getEmergencyQueue,
    enabled: isStaffOrDoctor,
    refetchInterval: 10000, // Check ER queue every 10 seconds
  })

  if (!isStaffOrDoctor) return null

  const immediateCases = queue?.filter((c) => c.priority === 1 && c.status === 'Waiting') ?? []
  if (immediateCases.length === 0) return null

  const activeCase = immediateCases[0]
  if (dismissedId === activeCase.id) return null

  return (
    <div className="bg-rose-600 text-white px-4 py-2.5 shadow-lg border-b border-rose-700 flex items-center justify-between animate-fade-in z-20 sticky top-0 select-none">
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-3 h-3 rounded-full bg-white animate-ping shrink-0" />
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-bold">
          <span className="bg-rose-950/40 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
            🚨 CODE RED EMERGENCY
          </span>
          <span className="truncate">
            Priority 1 triage in ER: <strong>{activeCase.patientName}</strong> ({activeCase.complaint})
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-3">
        <Link
          to="/emergency"
          className="px-3 py-1 bg-white text-rose-700 hover:bg-rose-50 text-xs font-extrabold rounded-lg shadow-sm transition-all"
        >
          Attend ER Queue →
        </Link>
        <button
          onClick={() => setDismissedId(activeCase.id)}
          className="text-white/80 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-rose-700 transition-colors"
          title="Dismiss alert"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
