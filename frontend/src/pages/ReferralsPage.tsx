import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getReferralsByPatient, createReferral, updateReferralStatus } from '../api/referrals'
import { getPatients } from '../api/patients'
import { getDoctors } from '../api/doctors'

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Accepted: 'bg-teal-50 text-teal-700 border-teal-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function ReferralsPage() {
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [referringDoctorId, setReferringDoctorId] = useState('')
  const [referredToDoctorId, setReferredToDoctorId] = useState('')
  const [reason, setReason] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: patientsResult } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => getPatients(1, 100),
  })
  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors })

  const { data: referrals, isLoading } = useQuery({
    queryKey: ['referrals', selectedPatientId],
    queryFn: () => getReferralsByPatient(selectedPatientId),
    enabled: !!selectedPatientId,
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPatientId || !referringDoctorId || !referredToDoctorId || !reason) return
    setError(null)
    try {
      await createReferral({
        patientId: selectedPatientId,
        referringDoctorId,
        referredToDoctorId,
        reason,
        isUrgent,
      })
      queryClient.invalidateQueries({ queryKey: ['referrals', selectedPatientId] })
      setReason('')
      setIsUrgent(false)
    } catch {
      setError('Failed to create referral.')
    }
  }

  async function handleUpdateStatus(id: string, status: string) {
    await updateReferralStatus(id, status)
    queryClient.invalidateQueries({ queryKey: ['referrals', selectedPatientId] })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-teal-500 rounded-full" />
        <h1 className="text-2xl font-bold text-slate-800">Referrals</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-medium text-slate-600 mb-1">Select Patient</label>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="w-full max-w-md border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Select a patient...</option>
          {patientsResult?.items.map((p) => (
            <option key={p.id} value={p.id}>
              {p.fullName}
            </option>
          ))}
        </select>
      </div>

      {selectedPatientId && (
        <>
          <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">New Referral</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Referring Doctor *</label>
                <select
                  value={referringDoctorId}
                  onChange={(e) => setReferringDoctorId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Select...</option>
                  {doctors?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Referred To *</label>
                <select
                  value={referredToDoctorId}
                  onChange={(e) => setReferredToDoctorId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Select...</option>
                  {doctors?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Reason *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              Urgent (triggers emergency queue if accepted)
            </label>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Create Referral
            </button>
          </form>

          {isLoading ? (
            <p className="text-slate-500">Loading referrals...</p>
          ) : (
            <div className="space-y-3">
              {referrals?.map((r) => (
                <div key={r.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-800">
                        {r.referringDoctorName} → {r.referredToDoctorName}
                      </p>
                      <p className="text-sm text-slate-500">{r.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.isUrgent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Urgent
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          statusColors[r.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                  {r.status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'Accepted')}
                      className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                    >
                      Accept
                    </button>
                  )}
                  {r.status === 'Accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(r.id, 'Completed')}
                      className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              ))}
              {referrals?.length === 0 && (
                <p className="text-slate-400 text-center py-6">No referrals for this patient yet.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}