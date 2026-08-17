import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getReferralsByPatient, createReferral, updateReferralStatus } from '../api/referrals'
import { getPatients, getMyProfile } from '../api/patients'
import { getDoctors } from '../api/doctors'
import { useAuthStore } from '../store/authStore'
import { canCreate } from '../lib/permissions'

const statusBadges: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-600', border: 'border-amber-200' },
  Accepted: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-600', border: 'border-teal-200' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-600', border: 'border-emerald-200' },
}

export default function ReferralsPage() {
  const role = useAuthStore((s) => s.role)
  const patientId = useAuthStore((s) => s.patientId)
  const doctorIdClaim = useAuthStore((s) => s.doctorId)
  const isPatient = role === 'Patient'
  const isDoctor = role === 'Doctor'
  const isAuthorizedToCreate = canCreate(role, 'referrals')

  const [selectedPatientId, setSelectedPatientId] = useState(isPatient ? patientId ?? '' : '')
  const [referringDoctorId, setReferringDoctorId] = useState(isDoctor ? doctorIdClaim ?? '' : '')
  const [referredToDoctorId, setReferredToDoctorId] = useState('')
  const [reason, setReason] = useState('')
  const [isUrgent, setIsUrgent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

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

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: getDoctors,
  })

  const activePatientId = isPatient ? patientId ?? '' : selectedPatientId

  const { data: referrals, isLoading } = useQuery({
    queryKey: ['referrals', activePatientId],
    queryFn: () => getReferralsByPatient(activePatientId),
    enabled: !!activePatientId,
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!activePatientId || !referringDoctorId || !referredToDoctorId || !reason.trim()) return
    setError(null)
    setIsSubmitting(true)
    try {
      await createReferral({
        patientId: activePatientId,
        referringDoctorId,
        referredToDoctorId,
        reason: reason.trim(),
        isUrgent,
      })
      queryClient.invalidateQueries({ queryKey: ['referrals', activePatientId] })
      setReason('')
      setIsUrgent(false)
    } catch {
      setError('Failed to create medical referral.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateStatus(id: string, status: string) {
    await updateReferralStatus(id, status)
    queryClient.invalidateQueries({ queryKey: ['referrals', activePatientId] })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isPatient ? 'My Specialist Referrals' : 'Specialist Referrals'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isPatient
              ? 'View specialist consultations and departmental referrals issued by your attending physicians.'
              : 'Refer patients between medical specialties and manage inter-departmental transfers.'}
          </p>
        </div>
      </div>

      {/* Patient Selector */}
      {!isPatient && (
        <div className="app-card p-6">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Patient to View or Issue Referrals
          </label>
          <div className="max-w-md">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="app-select"
            >
              <option value="">Choose a patient...</option>
              {patientsResult?.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Patient Chip for Patient Role */}
      {isPatient && myProfile && (
        <div className="app-card p-4 flex items-center gap-4 bg-teal-50/40 border-teal-200/60">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-base shrink-0">
            {myProfile.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{myProfile.fullName}</p>
            <p className="text-xs text-slate-500 font-mono">Patient #{myProfile.patientNumber}</p>
          </div>
        </div>
      )}

      {activePatientId && (
        <>
          {/* Create Referral Form */}
          {isAuthorizedToCreate && (
            <div className="app-card p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  ↗
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Issue Specialist Referral</h2>
                  <p className="text-xs text-slate-500">Transfer patient care to another clinical specialist</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {!isDoctor && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Referring Physician *
                      </label>
                      <select
                        value={referringDoctorId}
                        onChange={(e) => setReferringDoctorId(e.target.value)}
                        className="app-select"
                        required
                      >
                        <option value="">Select referring doctor...</option>
                        {doctors?.map((d) => (
                          <option key={d.id} value={d.id}>
                            Dr. {d.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className={isDoctor ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Referred To Specialist *
                    </label>
                    <select
                      value={referredToDoctorId}
                      onChange={(e) => setReferredToDoctorId(e.target.value)}
                      className="app-select"
                      required
                    >
                      <option value="">Select destination specialist...</option>
                      {doctors
                        ?.filter((d) => d.id !== referringDoctorId)
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            Dr. {d.fullName} ({d.specialties.join(', ') || 'General'})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Clinical Justification & Reason *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Needs cardiac evaluation for suspected arrhythmia..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isUrgent"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <label htmlFor="isUrgent" className="text-sm font-semibold text-rose-700 cursor-pointer">
                    Flag as High Priority / Urgent Case
                  </label>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                    {error}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isSubmitting || !referredToDoctorId} className="btn-primary">
                    {isSubmitting ? 'Creating...' : 'Issue Referral'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Referrals List Card */}
          <div className="app-card overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Referral History</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                {referrals?.length ?? 0} referrals
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-400">Loading referrals...</div>
            ) : !referrals || referrals.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No specialist referrals on record for this patient.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">Referring Doctor</th>
                      <th className="table-header">Referred Specialist</th>
                      <th className="table-header">Clinical Reason</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Priority</th>
                      <th className="table-header">Status</th>
                      {isAuthorizedToCreate && <th className="table-header text-right">Update Status</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {referrals.map((ref) => {
                      const badge = statusBadges[ref.status] || {
                        bg: 'bg-slate-50',
                        text: 'text-slate-700',
                        dot: 'bg-slate-500',
                        border: 'border-slate-200',
                      }
                      return (
                        <tr key={ref.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="table-cell font-semibold text-slate-800">Dr. {ref.referringDoctorName}</td>
                          <td className="table-cell font-bold text-slate-900">Dr. {ref.referredToDoctorName}</td>
                          <td className="table-cell text-slate-700 max-w-xs">{ref.reason}</td>
                          <td className="table-cell text-slate-500 text-xs font-mono">
                            {new Date(ref.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="table-cell">
                            {ref.isUrgent ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                Urgent
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500 font-medium">Standard</span>
                            )}
                          </td>
                          <td className="table-cell">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {ref.status}
                            </span>
                          </td>
                          {isAuthorizedToCreate && (
                            <td className="table-cell text-right">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                {ref.status === 'Pending' && (
                                  <button
                                    onClick={() => handleUpdateStatus(ref.id, 'Accepted')}
                                    className="h-8 px-2.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-600 hover:text-white border border-teal-200 rounded-lg transition-all"
                                  >
                                    Accept
                                  </button>
                                )}
                                {ref.status === 'Accepted' && (
                                  <button
                                    onClick={() => handleUpdateStatus(ref.id, 'Completed')}
                                    className="h-8 px-2.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded-lg transition-all"
                                  >
                                    Complete
                                  </button>
                                )}
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
        </>
      )}
    </div>
  )
}