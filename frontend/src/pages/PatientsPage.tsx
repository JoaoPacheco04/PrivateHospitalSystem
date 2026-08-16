import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getPatients } from '../api/patients'

export default function PatientsPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', page],
    queryFn: () => getPatients(page, 10),
  })

  if (isLoading) return <p className="text-slate-500">Loading...</p>
  if (error) return <p className="text-red-600">Failed to load patients.</p>
  if (!data) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-teal-500 rounded-full" />
          <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
        </div>
        <Link
          to="/patients/new"
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
        >
          + New Patient
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-teal-50/60 border-b border-teal-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-teal-800">Number</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800">Name</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800">Insurance</th>
              <th className="text-left px-4 py-3 font-medium text-teal-800"></th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((patient) => (
              <tr key={patient.id} className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors">
                <td className="px-4 py-3 text-slate-500">{patient.patientNumber}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{patient.fullName}</td>
                <td className="px-4 py-3 text-slate-600">{patient.phoneNumber}</td>
                <td className="px-4 py-3">
                  {patient.insuranceProviderName ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {patient.insuranceProviderName}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                      No insurance
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/patients/${patient.id}`} className="text-teal-600 hover:text-teal-700 font-medium">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-slate-500">
          Page {data.page} of {data.totalPages} ({data.totalCount} patients)
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-600 disabled:opacity-40 hover:bg-teal-50 hover:border-teal-300 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-600 disabled:opacity-40 hover:bg-teal-50 hover:border-teal-300 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}