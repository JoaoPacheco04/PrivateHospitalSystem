import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getDoctors } from '../api/doctors'
import { useAuthStore } from '../store/authStore'
import { canCreate } from '../lib/permissions'

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const role = useAuthStore((s) => s.role)
  const { data: doctors, isLoading, error } = useQuery({
    queryKey: ['doctors'],
    queryFn: getDoctors,
  })

  const filteredDoctors = doctors?.filter(
    (d) =>
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Doctors Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage physician profiles, medical licenses, specialties and clinical schedules.</p>
        </div>
        {canCreate(role, 'doctors') && (
          <Link to="/doctors/new" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>New Doctor</span>
          </Link>
        )}
      </div>

      {/* Main Content Card */}
      <div className="app-card overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by name, specialty, license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 px-3 py-1.5 bg-white rounded-lg border border-slate-200 self-start sm:self-auto">
            Total Doctors: <strong className="text-slate-800">{doctors?.length ?? 0}</strong>
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <svg className="w-6 h-6 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-medium">Loading medical staff...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50/50">
            <p className="text-sm font-semibold">Failed to load doctor profiles.</p>
          </div>
        ) : !filteredDoctors || filteredDoctors.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-medium">No doctors match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">Doctor</th>
                  <th className="table-header">Medical License</th>
                  <th className="table-header">Specialties</th>
                  <th className="table-header">Phone Contact</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 font-bold text-sm flex items-center justify-center border border-sky-100 dark:border-sky-800 shrink-0">
                          Dr
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{doc.fullName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{doc.email || 'No email provided'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-mono text-xs text-slate-700 dark:text-slate-300">{doc.licenseNumber}</td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {doc.specialties.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="table-cell text-slate-600 dark:text-slate-300 font-mono text-xs">{doc.phoneNumber || '—'}</td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Active
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <Link
                        to={`/doctors/${doc.id}`}
                        className="h-8 px-3 inline-flex items-center justify-center text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-600 hover:text-white border border-teal-200 hover:border-teal-600 rounded-lg transition-all"
                      >
                        {canCreate(role, 'doctors') ? 'Edit Doctor' : 'View Profile'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}