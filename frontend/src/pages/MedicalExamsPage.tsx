import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getExamsByPatient, createMedicalExam, completeMedicalExam } from '../api/medicalExams'
import { getPatients, getMyProfile } from '../api/patients'
import { getDoctors } from '../api/doctors'
import { useAuthStore } from '../store/authStore'
import { canCreate } from '../lib/permissions'
import { toast } from '../store/toastStore'
import ExamViewerModal from '../components/ExamViewerModal'
import type { MedicalExam } from '../types/medicalExam'

const statusBadges: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  Requested: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-600', border: 'border-amber-200' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-600', border: 'border-emerald-200' },
}

export default function MedicalExamsPage() {
  const role = useAuthStore((s) => s.role)
  const patientId = useAuthStore((s) => s.patientId)
  const doctorIdClaim = useAuthStore((s) => s.doctorId)
  const isPatient = role === 'Patient'
  const isDoctor = role === 'Doctor'
  const isAuthorizedToCreate = canCreate(role, 'exams')

  const [selectedPatientId, setSelectedPatientId] = useState(isPatient ? patientId ?? '' : '')
  const [doctorId, setDoctorId] = useState(isDoctor ? doctorIdClaim ?? '' : '')
  const [examType, setExamType] = useState('')
  const [resultInputs, setResultInputs] = useState<Record<string, string>>({})
  const [selectedExamToView, setSelectedExamToView] = useState<MedicalExam | null>(null)
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
    enabled: !isDoctor && isAuthorizedToCreate,
  })

  const activePatientId = isPatient ? patientId ?? '' : selectedPatientId
  const activePatientName = isPatient
    ? myProfile?.fullName
    : patientsResult?.items.find((p) => p.id === activePatientId)?.fullName

  const { data: exams, isLoading } = useQuery({
    queryKey: ['medicalExams', activePatientId],
    queryFn: () => getExamsByPatient(activePatientId),
    enabled: !!activePatientId,
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!activePatientId || !doctorId || !examType.trim()) return
    setError(null)
    setIsSubmitting(true)
    try {
      await createMedicalExam({ patientId: activePatientId, doctorId, examType: examType.trim() })
      queryClient.invalidateQueries({ queryKey: ['medicalExams', activePatientId] })
      setExamType('')
    } catch {
      setError('Failed to order medical exam.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleComplete(id: string) {
    const result = resultInputs[id]
    if (!result || !result.trim()) return
    await completeMedicalExam(id, result.trim())
    queryClient.invalidateQueries({ queryKey: ['medicalExams', activePatientId] })
    setResultInputs((prev) => ({ ...prev, [id]: '' }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isPatient ? 'My Medical Exams & Tests' : 'Diagnostic Exams & Lab Tests'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isPatient
              ? 'View diagnostic lab orders, imaging requests and examination results.'
              : 'Order diagnostic tests, record laboratory results and clinical findings.'}
          </p>
        </div>
      </div>

      {/* Patient Selector for Medical Staff */}
      {!isPatient && (
        <div className="app-card p-6">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Patient to View or Order Exams
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
          {/* Order Exam Form */}
          {isAuthorizedToCreate && (
            <div className="app-card p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  🔬
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Order New Diagnostic Exam</h2>
                  <p className="text-xs text-slate-500">Request laboratory analysis, bloodwork or radiology imaging</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {!isDoctor && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Ordering Physician *
                      </label>
                      <select
                        value={doctorId}
                        onChange={(e) => setDoctorId(e.target.value)}
                        className="app-select"
                        required
                      >
                        <option value="">Select doctor...</option>
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
                      Exam Type / Test Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Complete Blood Count, Chest X-Ray, Brain MRI"
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="app-input"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                    {error}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isSubmitting || !examType.trim()} className="btn-primary">
                    {isSubmitting ? 'Ordering...' : 'Order Exam'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Exams List Card */}
          <div className="app-card overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Diagnostic Exam History</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                {exams?.length ?? 0} exams
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-400">Loading exams...</div>
            ) : !exams || exams.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No diagnostic exams recorded for this patient.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">Exam Test</th>
                      <th className="table-header">Ordering Physician</th>
                      <th className="table-header">Requested Date</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Laboratory Results / Findings</th>
                      {isAuthorizedToCreate && <th className="table-header text-right">Upload Result</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exams.map((exam) => {
                      const badge = statusBadges[exam.status] || {
                        bg: 'bg-slate-50',
                        text: 'text-slate-700',
                        dot: 'bg-slate-500',
                        border: 'border-slate-200',
                      }
                      return (
                        <tr key={exam.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="table-cell font-bold text-slate-900">{exam.examType}</td>
                          <td className="table-cell text-slate-700 font-medium">Dr. {exam.doctorName}</td>
                          <td className="table-cell text-slate-500 text-xs font-mono">
                            {new Date(exam.requestedAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="table-cell">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {exam.status}
                            </span>
                          </td>
                          <td className="table-cell text-slate-800 max-w-sm">
                            {exam.result ? (
                              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono leading-relaxed">
                                {exam.result}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Awaiting laboratory findings...</span>
                            )}
                          </td>
                          <td className="table-cell text-right">
                            <div className="inline-flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedExamToView(exam)}
                                className="h-8 px-2.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-600 hover:text-white border border-teal-200 rounded-lg transition-all"
                              >
                                🩻 View Scan
                              </button>

                              {isAuthorizedToCreate && exam.status === 'Requested' && (
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    placeholder="Enter result..."
                                    value={resultInputs[exam.id] ?? ''}
                                    onChange={(e) =>
                                      setResultInputs((prev) => ({ ...prev, [exam.id]: e.target.value }))
                                    }
                                    className="w-36 h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-medium"
                                  />
                                  <button
                                    onClick={() => handleComplete(exam.id)}
                                    disabled={!resultInputs[exam.id]?.trim()}
                                    className="h-8 px-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-all disabled:opacity-40"
                                  >
                                    Submit
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
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

      {/* Exam Imaging & Diagnostics Viewer Modal */}
      <ExamViewerModal
        exam={selectedExamToView}
        patientName={activePatientName}
        isOpen={!!selectedExamToView}
        onClose={() => setSelectedExamToView(null)}
      />
    </div>
  )
}