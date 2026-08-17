import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getPatients, deletePatient } from '../api/patients'
import { useAuthStore } from '../store/authStore'
import { useLanguageStore } from '../store/languageStore'
import { canCreate, canDelete } from '../lib/permissions'
import { exportToCsv } from '../lib/exportCsv'
import { toast } from '../store/toastStore'
import ConfirmModal from '../components/ConfirmModal'
import MedicalReportPrintModal from '../components/MedicalReportPrintModal'
import type { Patient } from '../types/patient'

export default function PatientsPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [selectedReportPatient, setSelectedReportPatient] = useState<Patient | null>(null)
  const role = useAuthStore((s) => s.role)
  const t = useLanguageStore((s) => s.t)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['patients', page],
    queryFn: () => getPatients(page, 10),
  })

  async function handleConfirmDelete() {
    if (!deleteTargetId) return
    try {
      await deletePatient(deleteTargetId)
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast.success('Patient record deleted successfully.')
    } catch {
      toast.error('Failed to delete patient.')
    } finally {
      setDeleteTargetId(null)
    }
  }

  const filteredPatients = data?.items.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('patients.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('patients.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.items && data.items.length > 0 && (
            <button
              onClick={() => {
                exportToCsv('hospital_patients', data.items, {
                  patientNumber: 'Patient Number',
                  fullName: 'Full Name',
                  phoneNumber: 'Phone',
                  email: 'Email',
                  insuranceProviderName: 'Insurance Provider',
                })
                toast.success('Patients exported to CSV!')
              }}
              className="btn-secondary"
            >
              📥 {t('app.exportCsv')}
            </button>
          )}
          {canCreate(role, 'patients') && (
            <Link to="/patients/new" className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>{t('app.newPatient')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="app-card overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={t('patients.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="app-input h-10 pl-10 pr-4 text-xs sm:text-sm"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            {t('dash.totalPatients')}: <strong className="text-slate-800 dark:text-white">{data?.totalCount ?? 0}</strong>
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <svg className="w-6 h-6 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-medium">{t('app.loading')}</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50 dark:bg-rose-950/30">
            <p className="text-sm font-semibold">Failed to load patients.</p>
          </div>
        ) : !filteredPatients || filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-medium">{t('app.noData')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">{t('patients.patientNumber')}</th>
                  <th className="table-header">{t('patients.name')}</th>
                  <th className="table-header">{t('patients.contacts')}</th>
                  <th className="table-header">{t('patients.insurance')}</th>
                  <th className="table-header">{t('patients.dob')}</th>
                  <th className="table-header text-right">{t('app.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="table-cell font-mono font-bold text-teal-700 dark:text-teal-400">
                      {patient.patientNumber}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {patient.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">{patient.fullName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{patient.gender || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <p className="text-slate-800 dark:text-slate-200 font-medium text-xs">{patient.phoneNumber || '—'}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{patient.email || '—'}</p>
                    </td>
                    <td className="table-cell">
                      {patient.insuranceProviderName ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          🛡️ {patient.insuranceProviderName}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Private Pay</span>
                      )}
                    </td>
                    <td className="table-cell text-slate-600 dark:text-slate-300 text-xs font-mono">
                      {patient.dateOfBirth
                        ? new Date(patient.dateOfBirth).toLocaleDateString('en-GB')
                        : '—'}
                    </td>
                    <td className="table-cell text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReportPatient(patient)}
                          className="h-8 px-2.5 inline-flex items-center justify-center text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-600 hover:text-white border border-teal-200 dark:border-teal-800 rounded-lg transition-all"
                          title="Print Patient Comprehensive Clinical Dossier"
                        >
                          📄 Report
                        </button>
                        <Link
                          to={`/patients/${patient.id}`}
                          className="h-8 px-3 inline-flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white rounded-lg transition-all"
                        >
                          Edit
                        </Link>
                        {canDelete(role, 'patients') && (
                          <button
                            onClick={() => setDeleteTargetId(patient.id)}
                            className="h-8 px-3 inline-flex items-center justify-center text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-lg transition-all"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary h-8 px-3 text-xs"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500 font-semibold">
              Page <strong className="text-slate-800 dark:text-white">{page}</strong> of {data.totalPages}
            </span>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary h-8 px-3 text-xs"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Patient Record?"
        message="Are you sure you want to delete this patient? This action cannot be undone."
        confirmLabel="Yes, Delete Record"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Medical Report Print Modal */}
      <MedicalReportPrintModal
        patient={selectedReportPatient}
        isOpen={!!selectedReportPatient}
        onClose={() => setSelectedReportPatient(null)}
      />
    </div>
  )
}