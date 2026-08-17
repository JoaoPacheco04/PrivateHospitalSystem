import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSurgeries, createSurgery, addSurgeryTeamMember } from '../api/surgeries'
import { getPatients } from '../api/patients'
import { getDoctors } from '../api/doctors'
import { getRooms } from '../api/rooms'
import { useAuthStore } from '../store/authStore'
import { canCreate } from '../lib/permissions'

const statusBadges: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  Scheduled: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-600', border: 'border-teal-200' },
  InProgress: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-600', border: 'border-amber-200' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-600', border: 'border-emerald-200' },
  Cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-600', border: 'border-rose-200' },
}

export default function SurgeriesPage() {
  const role = useAuthStore((s) => s.role)
  const isAuthorized = canCreate(role, 'surgeries')

  const [patientId, setPatientId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [procedureName, setProcedureName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(90)
  const [error, setError] = useState<string | null>(null)
  const [teamDoctorId, setTeamDoctorId] = useState<Record<string, string>>({})
  const [teamRole, setTeamRole] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const { data: surgeries, isLoading } = useQuery({ queryKey: ['surgeries'], queryFn: getSurgeries })
  const { data: patientsResult } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => getPatients(1, 100),
  })
  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors })
  const { data: rooms } = useQuery({ queryKey: ['rooms'], queryFn: getRooms })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!patientId || !roomId || !procedureName.trim() || !date || !time) return
    setIsSubmitting(true)
    try {
      await createSurgery({
        patientId,
        roomId,
        procedureName: procedureName.trim(),
        scheduledAt: `${date}T${time}:00`,
        durationMinutes,
      })
      queryClient.invalidateQueries({ queryKey: ['surgeries'] })
      setProcedureName('')
      setDate('')
      setTime('')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: string } })?.response?.data ||
        'Failed to schedule surgery. Please check for operating theatre time conflicts.'
      setError(typeof message === 'string' ? message : 'Failed to schedule surgery.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleAddTeamMember(surgeryId: string) {
    const doctorId = teamDoctorId[surgeryId]
    const surgicalRole = teamRole[surgeryId]
    if (!doctorId || !surgicalRole) return
    await addSurgeryTeamMember(surgeryId, { doctorId, role: surgicalRole })
    queryClient.invalidateQueries({ queryKey: ['surgeries'] })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Surgical Operations & Theatres</h1>
          <p className="text-slate-500 text-sm mt-1">Schedule surgical procedures, operating theatre reservations and multidisciplinary teams.</p>
        </div>

        <div className="px-4 py-2 bg-teal-50 border border-teal-200 rounded-xl text-xs font-semibold text-teal-800 self-start sm:self-auto">
          Total Surgeries: <strong className="text-teal-900 font-extrabold text-sm ml-1">{surgeries?.length ?? 0}</strong>
        </div>
      </div>

      {/* Schedule Surgery Form */}
      {isAuthorized && (
        <div className="app-card p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              🩺
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Schedule Surgical Procedure</h2>
              <p className="text-xs text-slate-500">Book an operating room and set duration for patient operation</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Patient *
                </label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="app-select"
                  required
                >
                  <option value="">Select patient...</option>
                  {patientsResult?.items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.patientNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Operating Room *
                </label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="app-select"
                  required
                >
                  <option value="">Select room...</option>
                  {rooms?.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} ({r.department || 'Theatre'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Procedure Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Appendectomy, Knee Arthroscopy"
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  className="app-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="app-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="app-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Est. Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="app-input"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Scheduling...' : 'Schedule Surgery'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Surgeries List Card */}
      <div className="app-card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Scheduled Surgeries</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {surgeries?.length ?? 0} operations
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading scheduled surgeries...</div>
        ) : !surgeries || surgeries.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No surgical operations currently scheduled.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">Procedure</th>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Theatre Room</th>
                  <th className="table-header">Schedule</th>
                  <th className="table-header">Duration</th>
                  <th className="table-header">Surgical Team</th>
                  <th className="table-header">Status</th>
                  {isAuthorized && <th className="table-header text-right">Team Assignment</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {surgeries.map((surg) => {
                  const badge = statusBadges[surg.status] || {
                    bg: 'bg-slate-50',
                    text: 'text-slate-700',
                    dot: 'bg-slate-500',
                    border: 'border-slate-200',
                  }
                  const dateObj = new Date(surg.scheduledAt)
                  return (
                    <tr key={surg.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="table-cell font-bold text-slate-900">{surg.procedureName}</td>
                      <td className="table-cell">
                        <p className="font-bold text-slate-800 text-sm leading-tight">{surg.patientName}</p>
                        <p className="text-xs text-slate-400 font-mono">Patient #{surg.patientNumber}</p>
                      </td>
                      <td className="table-cell font-mono text-xs font-semibold text-slate-700">
                        Room {surg.roomNumber}
                      </td>
                      <td className="table-cell text-slate-600 text-xs font-mono">
                        {dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
                        <strong>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                      </td>
                      <td className="table-cell text-slate-700 font-medium">{surg.durationMinutes} mins</td>
                      <td className="table-cell">
                        {surg.teamMembers && surg.teamMembers.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {surg.teamMembers.map((tm, idx) => (
                              <span key={idx} className="text-xs text-slate-700">
                                <strong className="text-slate-900">Dr. {tm.doctorName}</strong> ({tm.role})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No team assigned</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {surg.status}
                        </span>
                      </td>
                      {isAuthorized && (
                        <td className="table-cell text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <select
                              value={teamDoctorId[surg.id] ?? ''}
                              onChange={(e) =>
                                setTeamDoctorId((prev) => ({ ...prev, [surg.id]: e.target.value }))
                              }
                              className="h-9 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                            >
                              <option value="">Select Doctor...</option>
                              {doctors?.map((d) => (
                                <option key={d.id} value={d.id}>
                                  Dr. {d.fullName}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="Role (e.g. Lead, Anesthetist)"
                              value={teamRole[surg.id] ?? ''}
                              onChange={(e) =>
                                setTeamRole((prev) => ({ ...prev, [surg.id]: e.target.value }))
                              }
                              className="w-36 h-9 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                            />
                            <button
                              onClick={() => handleAddTeamMember(surg.id)}
                              disabled={!teamDoctorId[surg.id] || !teamRole[surg.id]}
                              className="h-9 px-3 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 font-bold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Add
                            </button>
                          </div>
                        </td>
                      )}
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