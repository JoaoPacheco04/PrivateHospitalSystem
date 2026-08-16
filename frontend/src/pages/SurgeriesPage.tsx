import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getSurgeries, createSurgery, addSurgeryTeamMember } from '../api/surgeries'
import { getPatients } from '../api/patients'
import { getDoctors } from '../api/doctors'
import { getRooms } from '../api/rooms'

const statusColors: Record<string, string> = {
  Scheduled: 'bg-teal-50 text-teal-700 border-teal-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  InProgress: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function SurgeriesPage() {
  const [patientId, setPatientId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [procedureName, setProcedureName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(90)
  const [error, setError] = useState<string | null>(null)
  const [teamDoctorId, setTeamDoctorId] = useState<Record<string, string>>({})
  const [teamRole, setTeamRole] = useState<Record<string, string>>({})
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
    if (!patientId || !roomId || !procedureName || !date || !time) return
    try {
      await createSurgery({
        patientId,
        roomId,
        procedureName,
        scheduledAt: `${date}T${time}:00`,
        durationMinutes,
      })
      queryClient.invalidateQueries({ queryKey: ['surgeries'] })
      setProcedureName('')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: string } })?.response?.data ||
        'Failed to schedule surgery. Check for room conflicts.'
      setError(typeof message === 'string' ? message : 'Failed to schedule surgery.')
    }
  }

  async function handleAddTeamMember(surgeryId: string) {
    const doctorId = teamDoctorId[surgeryId]
    const role = teamRole[surgeryId]
    if (!doctorId || !role) return
    await addSurgeryTeamMember(surgeryId, { doctorId, role })
    queryClient.invalidateQueries({ queryKey: ['surgeries'] })
    setTeamDoctorId((prev) => ({ ...prev, [surgeryId]: '' }))
    setTeamRole((prev) => ({ ...prev, [surgeryId]: '' }))
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-teal-500 rounded-full" />
        <h1 className="text-2xl font-bold text-slate-800">Surgeries</h1>
      </div>

      <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Schedule Surgery</h2>

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
            <label className="block text-sm font-medium text-slate-600 mb-1">Room *</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Select a room...</option>
              {rooms?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.roomNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Procedure *</label>
          <input
            type="text"
            value={procedureName}
            onChange={(e) => setProcedureName(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Time *</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Duration (min)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
        >
          Schedule Surgery
        </button>
      </form>

      {isLoading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="space-y-4">
          {surgeries?.map((s) => (
            <div key={s.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-800">{s.procedureName}</h3>
                  <p className="text-sm text-slate-500">
                    {s.patientName} — {s.roomNumber} —{' '}
                    {new Date(s.scheduledAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    statusColors[s.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {s.team.length > 0 ? (
                  s.team.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200"
                    >
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs">No team assigned yet</span>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  value={teamDoctorId[s.id] ?? ''}
                  onChange={(e) => setTeamDoctorId((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  className="border border-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Doctor...</option>
                  {doctors?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Role (e.g. Lead Surgeon)"
                  value={teamRole[s.id] ?? ''}
                  onChange={(e) => setTeamRole((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  className="border border-slate-300 rounded-lg px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={() => handleAddTeamMember(s.id)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg px-3 py-1 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}