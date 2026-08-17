import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getActiveAdmissions, createAdmission, dischargeAdmission } from '../api/admissions'
import { getPatients } from '../api/patients'
import { getBeds } from '../api/beds'
import { useAuthStore } from '../store/authStore'
import { canCreate } from '../lib/permissions'
import { exportToCsv } from '../lib/exportCsv'
import { toast } from '../store/toastStore'
import DischargeSummaryModal from '../components/DischargeSummaryModal'
import WristbandPrintModal from '../components/WristbandPrintModal'
import type { Admission } from '../types/admission'

export default function AdmissionsPage() {
  const role = useAuthStore((s) => s.role)
  const isAuthorized = canCreate(role, 'admissions')

  const [patientId, setPatientId] = useState('')
  const [bedId, setBedId] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dischargeTarget, setDischargeTarget] = useState<Admission | null>(null)
  const [wristbandTarget, setWristbandTarget] = useState<Admission | null>(null)
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
    setIsSubmitting(true)
    try {
      await createAdmission({ patientId, bedId, reason: reason.trim() || undefined })
      queryClient.invalidateQueries({ queryKey: ['admissions'] })
      queryClient.invalidateQueries({ queryKey: ['beds'] })
      setPatientId('')
      setBedId('')
      setReason('')
      toast.success('Patient admitted to hospital bed unit!')
    } catch {
      setError('Failed to admit patient. The selected bed may no longer be available.')
      toast.error('Failed to admit patient.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDirectDischarge(id: string) {
    if (!confirm('Discharge this patient and release bed unit?')) return
    try {
      await dischargeAdmission(id)
      queryClient.invalidateQueries({ queryKey: ['admissions'] })
      queryClient.invalidateQueries({ queryKey: ['beds'] })
      toast.success('Patient discharged and bed released.')
    } catch {
      toast.error('Failed to discharge patient.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Inpatient Admissions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage inpatient stays, hospital bed assignments and discharge summaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {admissions && admissions.length > 0 && (
            <button
              onClick={() => {
                exportToCsv('active_admissions', admissions as unknown as Record<string, unknown>[], {
                  patientName: 'Patient Name',
                  bedNumber: 'Bed #',
                  reason: 'Admission Reason',
                  admittedAt: 'Admitted Date',
                })
                toast.success('Admissions exported to CSV!')
              }}
              className="btn-secondary"
            >
              📥 Export CSV
            </button>
          )}

          <div className="px-4 py-2 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-semibold text-teal-800 dark:text-teal-300">
            Active Admissions: <strong className="text-teal-900 dark:text-white font-extrabold text-sm ml-1">{admissions?.length ?? 0}</strong>
          </div>
        </div>
      </div>

      {/* New Admission Form */}
      {isAuthorized && (
        <div className="app-card p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
              🏥
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Inpatient Admission Form</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Assign a patient to an available hospital bed unit</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Patient *
                </label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="app-select"
                  required
                >
                  <option value="">Select patient to admit...</option>
                  {patientsResult?.items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.patientNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Available Hospital Bed *
                </label>
                <select
                  value={bedId}
                  onChange={(e) => setBedId(e.target.value)}
                  className="app-select"
                  required
                >
                  <option value="">Choose an available bed...</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      Bed {b.bedNumber} — {b.department || 'General Ward'}
                    </option>
                  ))}
                </select>
                {availableBeds.length === 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                    ⚠️ No beds currently available. All units occupied or in maintenance.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Clinical Reason for Admission
              </label>
              <input
                type="text"
                placeholder="e.g. Post-operative observation, severe pneumonia, cardiac monitoring..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="app-input"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !patientId || !bedId}
                className="btn-primary"
              >
                {isSubmitting ? 'Admitting...' : 'Admit Patient'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Admissions Table Card */}
      <div className="app-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Current Inpatients Roster</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Patients currently occupying hospital beds</p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <svg className="w-6 h-6 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-medium">Loading active inpatient admissions...</p>
          </div>
        ) : !admissions || admissions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-medium">No patients currently admitted.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Bed / Ward</th>
                  <th className="table-header">Admission Date</th>
                  <th className="table-header">Clinical Reason</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {admissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="table-cell">
                      <p className="font-bold text-slate-900 dark:text-white">{adm.patientName}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        Patient #{adm.patientNumber || adm.patientId.substring(0, 8).toUpperCase()}
                      </p>
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs">
                        Bed {adm.bedNumber} {adm.department ? `(${adm.department})` : ''}
                      </span>
                    </td>
                    <td className="table-cell text-slate-600 dark:text-slate-300 text-xs font-mono">
                      {new Date(adm.admittedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="table-cell text-slate-700 dark:text-slate-300 max-w-xs">{adm.reason || 'General inpatient care'}</td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Admitted
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => setWristbandTarget(adm)}
                          className="h-8 px-2.5 inline-flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-600 hover:text-white border border-indigo-200 dark:border-indigo-800 rounded-lg transition-all"
                          title="Print Patient Identification Barcode Wristband"
                        >
                          🏷️ Wristband
                        </button>
                        {isAuthorized && (
                          <>
                            <button
                              onClick={() => setDischargeTarget(adm)}
                              className="h-8 px-3 inline-flex items-center justify-center text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-600 hover:text-white border border-teal-200 hover:border-teal-600 rounded-lg transition-all"
                            >
                              📋 Discharge
                            </button>
                            <button
                              onClick={() => handleDirectDischarge(adm.id)}
                              className="h-8 px-3 inline-flex items-center justify-center text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg transition-all"
                            >
                              Quick Exit
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Discharge Summary Modal */}
      <DischargeSummaryModal
        admissionId={dischargeTarget?.id ?? null}
        patientName={dischargeTarget?.patientName}
        isOpen={!!dischargeTarget}
        onClose={() => setDischargeTarget(null)}
        onCompleted={() => {
          queryClient.invalidateQueries({ queryKey: ['admissions'] })
          queryClient.invalidateQueries({ queryKey: ['beds'] })
        }}
      />

      {/* Hospital Wristband Print Modal */}
      <WristbandPrintModal
        admission={wristbandTarget}
        isOpen={!!wristbandTarget}
        onClose={() => setWristbandTarget(null)}
      />
    </div>
  )
}