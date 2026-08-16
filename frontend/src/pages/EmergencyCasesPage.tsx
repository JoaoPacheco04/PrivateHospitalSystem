import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getEmergencyQueue, createEmergencyCase, startEmergencyCase, completeEmergencyCase } from '../api/emergencyCases'
import { getPatients } from '../api/patients'
import { getDoctors } from '../api/doctors'
import { getBeds } from '../api/beds'

const priorityColors: Record<string, string> = {
  Immediate: 'bg-red-50 text-red-700 border-red-200',
  VeryUrgent: 'bg-orange-50 text-orange-700 border-orange-200',
  Urgent: 'bg-amber-50 text-amber-700 border-amber-200',
  Standard: 'bg-teal-50 text-teal-700 border-teal-200',
  NonUrgent: 'bg-slate-100 text-slate-600 border-slate-200',
}

export default function EmergencyCasesPage() {
  const [patientId, setPatientId] = useState('')
  const [complaint, setComplaint] = useState('')
  const [priority, setPriority] = useState(2)
  const [error, setError] = useState<string | null>(null)
  const [startDoctorId, setStartDoctorId] = useState<Record<string, string>>({})
  const [admissionBed, setAdmissionBed] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

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
    if (!patientId || !complaint) return
    setError(null)
    try {
      await createEmergencyCase({ patientId, complaint, priority })
      queryClient.invalidateQueries({ queryKey: ['emergencyQueue'] })
      setComplaint('')
    } catch {
      setError('Failed to create emergency case.')
    }
  }

  async function handleStart(id: string) {
    const doctorId = startDoctorId[id]
    if (!doctorId) return
    await startEmergencyCase(id, doctorId)
    queryClient.invalidateQueries({ queryKey: ['emergencyQueue'] })
  }

  async function handleComplete(id: string, requiresAdmission: boolean) {
    const bedId = admissionBed[id]
    await completeEmergencyCase(id, {
      requiresAdmission,
      bedId: requiresAdmission ? bedId : undefined,
    })
    queryClient.invalidateQueries({ queryKey: ['emergencyQueue'] })
    queryClient.invalidateQueries({ queryKey: ['beds'] })
    queryClient.invalidateQueries({ queryKey: ['admissions'] })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-teal-500 rounded-full" />
        <h1 className="text-2xl font-bold text-slate-800">Emergency Cases</h1>
      </div>

      <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">New Case</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Patient *</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Select a patient...</option>
              {patientsResult?.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Priority *</label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={1}>1 - Non Urgent</option>
              <option value={2}>2 - Standard</option>
              <option value={3}>3 - Urgent</option>
              <option value={4}>4 - Very Urgent</option>
              <option value={5}>5 - Immediate</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Complaint *</label>
          <input
            type="text"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
        >
          Add to Queue
        </button>
      </form>

      <h2 className="text-lg font-semibold text-slate-800 mb-3">Queue</h2>
      {isLoading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="space-y-3">
          {queue?.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-slate-800">{c.patientName}</p>
                  <p className="text-sm text-slate-500">{c.complaint}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      priorityColors[c.priority] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {c.priority}
                  </span>
                  <span className="text-xs text-slate-500">{c.status}</span>
                </div>
              </div>

              {c.status === 'Waiting' && (
                <div className="flex gap-2">
                  <select
                    value={startDoctorId[c.id] ?? ''}
                    onChange={(e) => setStartDoctorId((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    className="border border-slate-300 rounded-lg px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Assign doctor...</option>
                    {doctors?.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleStart(c.id)}
                    disabled={!startDoctorId[c.id]}
                    className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg px-3 py-1 transition-colors"
                  >
                    Start
                  </button>
                </div>
              )}

              {c.status === 'InProgress' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={admissionBed[c.id] ?? ''}
                    onChange={(e) => setAdmissionBed((prev) => ({ ...prev, [c.id]: e.target.value }))}
                    className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">No admission needed</option>
                    {availableBeds.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bedNumber} ({b.department})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleComplete(c.id, !!admissionBed[c.id])}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg px-3 py-1 transition-colors"
                  >
                    Complete {admissionBed[c.id] ? '& Admit' : ''}
                  </button>
                </div>
              )}
            </div>
          ))}
          {queue?.length === 0 && (
            <p className="text-slate-400 text-center py-6">No cases in the queue.</p>
          )}
        </div>
      )}
    </div>
  )
}