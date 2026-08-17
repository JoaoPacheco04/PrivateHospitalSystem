import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getEmergencyQueue, createEmergencyCase, startEmergencyCase, completeEmergencyCase } from '../api/emergencyCases'
import { getPatients } from '../api/patients'
import { getDoctors } from '../api/doctors'
import { getBeds } from '../api/beds'
import { useAuthStore } from '../store/authStore'
import { canCreate } from '../lib/permissions'
import { exportToCsv } from '../lib/exportCsv'
import { toast } from '../store/toastStore'

interface TriageLevel {
  label: string
  colorName: string
  waitTime: string
  bg: string
  text: string
  border: string
  dot: string
}

const MANCHESTER_TRIAGE: Record<number, TriageLevel> = {
  1: { label: 'Immediate / Emergency', colorName: 'Red', waitTime: '0 min (Immediate)', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800', dot: 'bg-rose-600' },
  2: { label: 'Very Urgent', colorName: 'Orange', waitTime: '10 min', bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-800', dot: 'bg-orange-600' },
  3: { label: 'Urgent', colorName: 'Yellow', waitTime: '60 min', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800', dot: 'bg-amber-600' },
  4: { label: 'Standard', colorName: 'Green', waitTime: '120 min', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-600' },
  5: { label: 'Non-Urgent', colorName: 'Blue', waitTime: '240 min', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-800', dot: 'bg-blue-600' },
}

function getManchesterTriage(priority: string | number): TriageLevel {
  const p = String(priority).toLowerCase()
  if (p === 'immediate' || p === '5' || p === '1' || p === 'red') {
    return MANCHESTER_TRIAGE[1]
  }
  if (p === 'veryurgent' || p === '4' || p === '2' || p === 'orange') {
    return MANCHESTER_TRIAGE[2]
  }
  if (p === 'urgent' || p === '3' || p === 'yellow') {
    return MANCHESTER_TRIAGE[3]
  }
  if (p === 'standard' || p === '2' || p === '4' || p === 'green') {
    return MANCHESTER_TRIAGE[4]
  }
  return MANCHESTER_TRIAGE[5]
}

export default function EmergencyCasesPage() {
  const [patientId, setPatientId] = useState('')
  const [complaint, setComplaint] = useState('')
  const [priority, setPriority] = useState(4)
  const [error, setError] = useState<string | null>(null)
  const [startDoctorId, setStartDoctorId] = useState<Record<string, string>>({})
  const [admissionBed, setAdmissionBed] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()
  const role = useAuthStore((s) => s.role)
  const isAuthorized = canCreate(role, 'emergency')

  const { data: queue, isLoading } = useQuery({ queryKey: ['emergencyQueue'], queryFn: getEmergencyQueue })
  const { data: patientsResult } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => getPatients(1, 100),
  })
  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors })
  const { data: beds } = useQuery({ queryKey: ['beds'], queryFn: getBeds })
  const availableBeds = beds?.filter((b) => b.status === 'Available') ?? []

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId || !complaint.trim()) return
    setError(null)
    setIsSubmitting(true)
    try {
      await createEmergencyCase({ patientId, complaint: complaint.trim(), priority })
      queryClient.invalidateQueries({ queryKey: ['emergencyQueue'] })
      setComplaint('')
      setPatientId('')
      toast.success('Emergency triage intake recorded!')
    } catch {
      setError('Failed to admit emergency case.')
      toast.error('Failed to register emergency case.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStart(id: string) {
    const docId = startDoctorId[id]
    if (!docId) return
    await startEmergencyCase(id, docId)
    queryClient.invalidateQueries({ queryKey: ['emergencyQueue'] })
    toast.success('Doctor attendance started for emergency case.')
  }

  async function handleComplete(id: string) {
    const bedId = admissionBed[id] || undefined
    await completeEmergencyCase(id, {
      requiresAdmission: !!bedId,
      bedId: bedId,
      admissionReason: bedId ? 'Admitted from Emergency Room' : undefined,
    })
    queryClient.invalidateQueries({ queryKey: ['emergencyQueue'] })
    queryClient.invalidateQueries({ queryKey: ['beds'] })
    queryClient.invalidateQueries({ queryKey: ['admissions'] })
    toast.success('Emergency treatment resolved / patient discharged.')
  }

  const redCount = queue?.filter((c) => c.priority === 'Immediate' || c.priority === '5' || c.priority === '1').length ?? 0
  const orangeCount = queue?.filter((c) => c.priority === 'VeryUrgent' || c.priority === '4' || c.priority === '2').length ?? 0
  const totalQueue = queue?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Emergency Care & Manchester Triage
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time ER admissions queue, Manchester protocol priority classification and doctor assignment.
          </p>
        </div>

        {queue && queue.length > 0 && (
          <button
            onClick={() => {
              exportToCsv('emergency_queue', queue, {
                patientName: 'Patient Name',
                priority: 'Triage Priority',
                complaint: 'Chief Complaint',
                status: 'Status',
                arrivedAt: 'Arrival Time',
              })
              toast.success('Emergency queue exported to CSV!')
            }}
            className="btn-secondary self-start sm:self-auto"
          >
            📥 Export ER Queue CSV
          </button>
        )}
      </div>

      {/* Manchester Protocol Status Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="app-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
            🚨
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Waiting in ER</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{totalQueue} Cases</p>
          </div>
        </div>

        <div className="app-card p-4 flex items-center gap-3 border-rose-200 dark:border-rose-900/40 bg-rose-50/20">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
            🔴
          </div>
          <div>
            <p className="text-xs text-rose-700 dark:text-rose-400 font-semibold">Immediate (Red)</p>
            <p className="text-xl font-extrabold text-rose-800 dark:text-rose-300">{redCount} Priority 1</p>
          </div>
        </div>

        <div className="app-card p-4 flex items-center gap-3 border-orange-200 dark:border-orange-900/40 bg-orange-50/20">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 flex items-center justify-center font-bold">
            🟠
          </div>
          <div>
            <p className="text-xs text-orange-700 dark:text-orange-400 font-semibold">Very Urgent (Orange)</p>
            <p className="text-xl font-extrabold text-orange-800 dark:text-orange-300">{orangeCount} Priority 2</p>
          </div>
        </div>

        <div className="app-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
            ⏱️
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Triage Protocol</p>
            <p className="text-base font-extrabold text-teal-700 dark:text-teal-400">Manchester System</p>
          </div>
        </div>
      </div>

      {/* New Emergency Case Intake Form */}
      {isAuthorized && (
        <div className="app-card p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-bold flex items-center justify-center">
              🚨
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Emergency Intake & Triage Assessment</h2>
              <p className="text-xs text-slate-500">Record arriving patient symptoms and assign Manchester triage color</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Patient *
                </label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="app-select"
                  required
                >
                  <option value="">Select presenting patient...</option>
                  {patientsResult?.items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.patientNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Manchester Triage Priority Color *
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="app-select font-bold"
                >
                  <option value={1}>🔴 Priority 1: Emergency / Red (0 min - Immediate)</option>
                  <option value={2}>🟠 Priority 2: Very Urgent / Orange (10 min)</option>
                  <option value={3}>🟡 Priority 3: Urgent / Yellow (60 min)</option>
                  <option value={4}>🟢 Priority 4: Standard / Green (120 min)</option>
                  <option value={5}>🔵 Priority 5: Non-Urgent / Blue (240 min)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Chief Complaint & Presenting Symptoms *
              </label>
              <input
                type="text"
                placeholder="e.g. Acute chest pain radiating to left arm, severe dyspnea..."
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="app-input"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={isSubmitting || !patientId || !complaint.trim()} className="btn-primary bg-rose-600 hover:bg-rose-700">
                {isSubmitting ? 'Admitting...' : 'Admit to ER Queue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Emergency Queue Table */}
      <div className="app-card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Live Emergency Queue</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {queue?.length ?? 0} cases active
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading emergency queue...</div>
        ) : !queue || queue.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No active emergency cases currently in queue.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">Manchester Triage Priority</th>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Chief Complaint</th>
                  <th className="table-header">Arrival Time</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Clinical Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {queue.map((c) => {
                  const triage = getManchesterTriage(c.priority)
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold border ${triage.bg} ${triage.text} ${triage.border}`}>
                          <span className={`w-2 h-2 rounded-full ${triage.dot} animate-pulse`} />
                          {triage.label} ({triage.waitTime})
                        </span>
                      </td>

                      <td className="table-cell">
                        <p className="font-bold text-slate-900 dark:text-white">{c.patientName}</p>
                      </td>

                      <td className="table-cell text-slate-700 dark:text-slate-300 max-w-xs font-medium">
                        {c.complaint}
                      </td>

                      <td className="table-cell text-slate-500 font-mono text-xs">
                        {new Date(c.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="table-cell">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {c.status}
                        </span>
                      </td>

                      <td className="table-cell text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {c.status === 'Waiting' && (
                            <div className="inline-flex items-center gap-1.5">
                              <select
                                value={startDoctorId[c.id] ?? ''}
                                onChange={(e) =>
                                  setStartDoctorId((prev) => ({ ...prev, [c.id]: e.target.value }))
                                }
                                className="h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                              >
                                <option value="">Assign Doctor...</option>
                                {doctors?.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    Dr. {d.fullName}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleStart(c.id)}
                                disabled={!startDoctorId[c.id]}
                                className="h-8 px-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg disabled:opacity-40"
                              >
                                Attend
                              </button>
                            </div>
                          )}

                          {(c.status === 'InProgress' || c.status === 'InAttendance') && (
                            <div className="inline-flex items-center gap-1.5">
                              <select
                                value={admissionBed[c.id] ?? ''}
                                onChange={(e) =>
                                  setAdmissionBed((prev) => ({ ...prev, [c.id]: e.target.value }))
                                }
                                className="h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                              >
                                <option value="">Discharge (or Admit Bed)...</option>
                                {availableBeds.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    Admit Bed {b.bedNumber}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleComplete(c.id)}
                                className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg"
                              >
                                Complete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}