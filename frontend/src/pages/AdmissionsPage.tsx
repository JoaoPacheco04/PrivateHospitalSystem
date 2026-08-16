import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getActiveAdmissions, createAdmission, dischargeAdmission } from '../api/admissions'
import { getPatients } from '../api/patients'
import { getBeds } from '../api/beds'

export default function AdmissionsPage() {
  const [patientId, setPatientId] = useState('')
  const [bedId, setBedId] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: admissions, isLoading } = useQuery({
    queryKey: ['admissions', 'active'],
    queryFn: getActiveAdmissions,
  })

  const { data: patientsResult } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => getPatients(1, 100),
  })

  const { data: beds } = useQuery({ queryKey: ['beds'], queryFn: getBeds })
  const availableBeds = beds?.filter((b) => b.status === 'Available') ?? []

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!patientId || !bedId) return
    setError(null)
    try {
      await createAdmission({ patientId, bedId, reason: reason || undefined })
      queryClient.invalidateQueries({ queryKey: ['admissions'] })
      queryClient.invalidateQueries({ queryKey: ['beds'] })
      setPatientId('')
      setBedId('')
      setReason('')
    } catch {
      setError('Failed to admit patient. Bed may not be available.')
    }
  }

  async function handleDischarge(id: string) {
    await dischargeAdmission(id)
    queryClient.invalidateQueries({ queryKey: ['admissions'] })
    queryClient.invalidateQueries({ queryKey: ['beds'] })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-teal-500 rounded-full" />
        <h1 className="text-2xl font-bold text-slate-800">Admissions</h1>
      </div>

      <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Admit Patient</h2>

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
            <label className="block text-sm font-medium text-slate-600 mb-1">Bed *</label>
            <select
              value={bedId}
              onChange={(e) => setBedId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Select an available bed...</option>
              {availableBeds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bedNumber} ({b.department})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
        >
          Admit Patient
        </button>
      </form>

      <h2 className="text-lg font-semibold text-slate-800 mb-3">Active Admissions</h2>
      {isLoading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-teal-50/60 border-b border-teal-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Patient</th>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Bed</th>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Admitted At</th>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Reason</th>
                <th className="text-left px-4 py-3 font-medium text-teal-800"></th>
              </tr>
            </thead>
            <tbody>
              {admissions?.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{a.patientName}</td>
                  <td className="px-4 py-3 text-slate-600">{a.bedNumber}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(a.admittedAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{a.reason ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDischarge(a.id)}
                      className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                    >
                      Discharge
                    </button>
                  </td>
                </tr>
              ))}
              {admissions?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No active admissions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}