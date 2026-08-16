import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getAppointments, cancelAppointment } from '../api/appointments'

const statusColors: Record<string, string> = {
  Scheduled: 'bg-teal-50 text-teal-700 border-teal-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
}

export default function AppointmentsPage() {
  const queryClient = useQueryClient()

  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  })

  async function handleCancel(id: string) {
    await cancelAppointment(id)
    queryClient.invalidateQueries({ queryKey: ['appointments'] })
  }

  if (isLoading) return <p className="text-slate-500">Loading...</p>
  if (error) return <p className="text-red-600">Failed to load appointments.</p>
  if (!appointments) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-teal-500 rounded-full" />
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
        </div>
        <Link
          to="/appointments/new"
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
        >
          + New Appointment
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-teal-50/60 border-b border-teal-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-teal-800">Date/Time</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800">Patient</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800">Doctor</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800">Room</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800">Status</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800"></th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id} className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors">
                <td className="px-4 py-3 text-slate-600">
                  {new Date(appt.scheduledAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">{appt.patientName}</td>
                <td className="px-4 py-3 text-slate-600">{appt.doctorName}</td>
                <td className="px-4 py-3 text-slate-600">{appt.roomNumber}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      statusColors[appt.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {appt.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {appt.status === 'Scheduled' && (
                    <button
                      onClick={() => handleCancel(appt.id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}