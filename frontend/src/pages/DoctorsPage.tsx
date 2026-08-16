import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getDoctors } from '../api/doctors'

export default function DoctorsPage() {
  const { data: doctors, isLoading, error } = useQuery({
    queryKey: ['doctors'],
    queryFn: getDoctors,
  })

  if (isLoading) return <p className="text-slate-500">Loading...</p>
  if (error) return <p className="text-red-600">Failed to load doctors.</p>
  if (!doctors) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-teal-500 rounded-full" />
          <h1 className="text-2xl font-bold text-slate-800">Doctors</h1>
        </div>
        <Link
          to="/doctors/new"
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
        >
          + New Doctor
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-teal-50/60 border-b border-teal-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-teal-800">Name</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800">License</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800">Specialties</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800">Status</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800"></th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{doctor.fullName}</td>
                <td className="px-4 py-3 text-slate-500">{doctor.licenseNumber}</td>
                <td className="px-4 py-3 text-slate-600">{doctor.phoneNumber}</td>
                <td className="px-4 py-3">
                  {doctor.specialties?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {doctor.specialties.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs">None</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      doctor.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {doctor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/doctors/${doctor.id}`} className="text-teal-600 hover:text-teal-700 font-medium">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}