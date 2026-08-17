import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createAppointment } from '../api/appointments'
import { getPatients, getMyProfile } from '../api/patients'
import { getDoctors } from '../api/doctors'
import { getRooms } from '../api/rooms'
import { useAuthStore } from '../store/authStore'
import SpeechDictationButton from '../components/SpeechDictationButton'

export default function AppointmentFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const role = useAuthStore((s) => s.role)
  const userPatientId = useAuthStore((s) => s.patientId)
  const isPatient = role === 'Patient'

  const [patientId, setPatientId] = useState(isPatient ? userPatientId ?? '' : '')
  const [doctorId, setDoctorId] = useState('')
  const [roomId, setRoomId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: patientsResult } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => getPatients(1, 100),
    enabled: !isPatient,
  })

  const { data: myProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
    enabled: isPatient,
  })

  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors })
  const { data: rooms } = useQuery({ queryKey: ['rooms'], queryFn: getRooms })

  useEffect(() => {
    if (isPatient && userPatientId) {
      setPatientId(userPatientId)
    }
  }, [isPatient, userPatientId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!patientId || !doctorId || !roomId || !date || !time) {
      setError('Please fill in all mandatory fields before scheduling.')
      return
    }

    const scheduledAt = `${date}T${time}:00`
    setIsSubmitting(true)

    try {
      await createAppointment({
        patientId,
        doctorId,
        roomId,
        scheduledAt,
        durationMinutes,
        notes: notes.trim() || undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      navigate(isPatient ? '/dashboard' : '/appointments')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: string } })?.response?.data ||
        'Failed to book appointment. There may be a physician or room schedule conflict.'
      setError(typeof message === 'string' ? message : 'Failed to create appointment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <Link to="/appointments" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 mb-2">
          ← Back to Appointments Schedule
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Book Clinical Consultation</h1>
        <p className="text-slate-500 text-sm mt-0.5">Select a specialist, available date and consultation room to schedule an appointment.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="app-card p-6 sm:p-7 space-y-5">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span>📅</span> Appointment Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient Selection */}
            {!isPatient ? (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Patient *</label>
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
            ) : (
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-sm">
                  {myProfile?.fullName.charAt(0) || 'P'}
                </div>
                <div>
                  <p className="text-xs text-teal-800 font-bold uppercase tracking-wider">Patient Booking</p>
                  <p className="text-sm font-bold text-slate-900">{myProfile?.fullName || 'My Account'}</p>
                </div>
              </div>
            )}

            {/* Doctor Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Physician / Doctor *</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="app-select"
                required
              >
                <option value="">Select doctor...</option>
                {doctors?.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.fullName} ({d.specialties.join(', ') || 'General'})
                  </option>
                ))}
              </select>
            </div>

            {/* Room Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Consultation Room *</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="app-select"
                required
              >
                <option value="">Select room...</option>
                {rooms?.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.roomNumber} ({r.department || 'Consultation'})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="app-input"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Time *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="app-input"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Est. Duration (Minutes)</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="app-select"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
              </select>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Reason for Visit / Clinical Notes
                </label>
                <SpeechDictationButton
                  onTranscript={(text) => setNotes((prev) => (prev ? `${prev} ${text}` : text))}
                />
              </div>
              <textarea
                rows={3}
                placeholder="e.g. Routine cardiovascular follow-up, symptom review..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-teal-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-xl">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/appointments" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Booking Consultation...' : 'Confirm Appointment'}
          </button>
        </div>
      </form>
    </div>
  )
}