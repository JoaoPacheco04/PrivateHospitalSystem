import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getAppointments, cancelAppointment } from '../api/appointments'
import { useAuthStore } from '../store/authStore'
import { canCreate } from '../lib/permissions'
import { exportToCsv } from '../lib/exportCsv'
import { toast } from '../store/toastStore'
import FeedbackModal from '../components/FeedbackModal'
import ConfirmModal from '../components/ConfirmModal'
import type { Appointment } from '../types/appointment'

const statusBadges: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  Scheduled: { bg: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', dot: 'bg-teal-600', border: 'border-teal-200 dark:border-teal-800' },
  Completed: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-600', border: 'border-emerald-200 dark:border-emerald-800' },
  Cancelled: { bg: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-600', border: 'border-rose-200 dark:border-rose-800' },
}

export default function AppointmentsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL')
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table')
  const [feedbackAppt, setFeedbackAppt] = useState<Appointment | null>(null)
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const role = useAuthStore((s) => s.role)
  const patientId = useAuthStore((s) => s.patientId)
  const isPatient = role === 'Patient'

  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  })

  async function handleConfirmCancel() {
    if (!cancelTargetId) return
    try {
      await cancelAppointment(cancelTargetId)
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment cancelled successfully.')
    } catch {
      toast.error('Failed to cancel appointment.')
    } finally {
      setCancelTargetId(null)
    }
  }

  const filtered = appointments?.filter((a) => {
    const matchesPatient = !isPatient || !patientId || a.patientId === patientId
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus
    const matchesSearch =
      a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.roomNumber && a.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()))

    // Date range filter
    let matchesDate = true
    const apptDate = new Date(a.scheduledAt)
    const now = new Date()
    if (dateRange === 'TODAY') {
      matchesDate = apptDate.toDateString() === now.toDateString()
    } else if (dateRange === 'WEEK') {
      const oneWeekFromNow = new Date()
      oneWeekFromNow.setDate(now.getDate() + 7)
      matchesDate = apptDate >= now && apptDate <= oneWeekFromNow
    } else if (dateRange === 'MONTH') {
      matchesDate = apptDate.getMonth() === now.getMonth() && apptDate.getFullYear() === now.getFullYear()
    }

    return matchesPatient && matchesStatus && matchesSearch && matchesDate
  })

  // Group appointments by date for Calendar view
  const groupedByDate = (filtered ?? []).reduce<Record<string, Appointment[]>>((acc, item) => {
    const d = new Date(item.scheduledAt).toISOString().split('T')[0]
    acc[d] = acc[d] ? [...acc[d], item] : [item]
    return acc
  }, {})

  const sortedDates = Object.keys(groupedByDate).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Appointments Schedule</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Book, review and manage patient consultations with assigned doctors.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              📋 Table View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              📅 Calendar View
            </button>
          </div>

          {/* Waiting Room TV Screen Link */}
          <a
            href="/waiting-room"
            target="_blank"
            rel="noreferrer"
            className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all"
            title="Open Hospital Waiting Room TV Calling Display in Full Screen"
          >
            <span>📺</span>
            <span>TV Lounge</span>
          </a>

          {filtered && filtered.length > 0 && (
            <button
              onClick={() => {
                exportToCsv('appointments_schedule', filtered, {
                  scheduledAt: 'Date & Time',
                  patientName: 'Patient Name',
                  doctorName: 'Doctor Name',
                  roomNumber: 'Room',
                  status: 'Status',
                })
                toast.success('Appointments exported to CSV!')
              }}
              className="btn-secondary"
            >
              📥 Export CSV
            </button>
          )}

          {canCreate(role, 'appointments') && (
            <Link to="/appointments/new" className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Book Appointment</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Filter Controls Bar */}
      <div className="app-card p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search patient or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="app-input h-10 pl-10 pr-4 text-xs sm:text-sm"
            />
          </div>

          {/* Date Period Filters */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  dateRange === r
                    ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {r === 'ALL' ? 'All Dates' : r === 'TODAY' ? 'Today' : r === 'WEEK' ? 'Next 7 Days' : 'This Month'}
              </button>
            ))}
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {['ALL', 'Scheduled', 'Completed', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === st
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 self-start lg:self-auto">
          Showing: <strong className="text-slate-800 dark:text-slate-200">{filtered?.length ?? 0}</strong> consultations
        </span>
      </div>

      {isLoading ? (
        <div className="app-card p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <svg className="w-6 h-6 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm font-medium">Loading appointments...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200">
          <p className="text-sm font-semibold">Failed to load appointments.</p>
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="app-card p-12 text-center text-slate-400">
          <p className="text-sm font-medium">No appointments found matching your criteria.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="app-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">Date & Time</th>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Assigned Doctor</th>
                  <th className="table-header">Consultation Room</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((appt) => {
                  const badge = statusBadges[appt.status] || {
                    bg: 'bg-slate-100',
                    text: 'text-slate-700',
                    dot: 'bg-slate-500',
                    border: 'border-slate-200',
                  }
                  const dateObj = new Date(appt.scheduledAt)
                  return (
                    <tr key={appt.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-tight">
                              {dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold mt-0.5 font-mono">
                              {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell font-bold text-slate-800 dark:text-slate-200">{appt.patientName}</td>
                      <td className="table-cell">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Dr. {appt.doctorName}</span>
                      </td>
                      <td className="table-cell">
                        {appt.roomNumber ? (
                          <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                            Room {appt.roomNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {appt.status}
                        </span>
                      </td>
                      <td className="table-cell text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {isPatient && appt.status === 'Completed' && (
                            <button
                              onClick={() => setFeedbackAppt(appt)}
                              className="h-8 px-3 inline-flex items-center justify-center text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-500 hover:text-white border border-amber-200 rounded-lg transition-all"
                            >
                              ★ Rate Care
                            </button>
                          )}
                          {appt.status === 'Scheduled' && (
                            <button
                              onClick={() => setCancelTargetId(appt.id)}
                              className="h-8 px-3 inline-flex items-center justify-center text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg transition-all"
                            >
                              Cancel Appointment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CALENDAR / DAY GRID VIEW */
        <div className="space-y-6">
          {sortedDates.map((dStr) => {
            const dayAppts = groupedByDate[dStr]
            const dateObj = new Date(dStr)
            return (
              <div key={dStr} className="app-card overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{dayAppts.length} appointments scheduled</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayAppts.map((appt) => {
                    const badge = statusBadges[appt.status] || {
                      bg: 'bg-slate-100',
                      text: 'text-slate-700',
                      dot: 'bg-slate-500',
                      border: 'border-slate-200',
                    }
                    return (
                      <div
                        key={appt.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {appt.status}
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{appt.patientName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">With Dr. {appt.doctorName}</p>
                          {appt.roomNumber && (
                            <p className="text-[11px] text-slate-400 font-mono mt-1">Room {appt.roomNumber}</p>
                          )}
                        </div>

                        {appt.status === 'Scheduled' && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex justify-end">
                            <button
                              onClick={() => setCancelTargetId(appt.id)}
                              className="text-xs font-bold text-rose-600 hover:text-rose-700"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!cancelTargetId}
        title="Cancel Scheduled Consultation?"
        message="Are you sure you want to cancel this appointment? This action will notify the attending doctor and free up the consultation slot."
        confirmLabel="Yes, Cancel Appointment"
        cancelLabel="Keep Appointment"
        isDanger={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTargetId(null)}
      />

      {/* Feedback Rating Modal */}
      {patientId && (
        <FeedbackModal
          patientId={patientId}
          appointmentId={feedbackAppt?.id}
          doctorName={feedbackAppt?.doctorName}
          isOpen={!!feedbackAppt}
          onClose={() => setFeedbackAppt(null)}
        />
      )}
    </div>
  )
}