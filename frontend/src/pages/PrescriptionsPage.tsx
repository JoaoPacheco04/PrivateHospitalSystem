import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPrescriptionsByPatient, createPrescription } from '../api/prescriptions'
import { getPatients, getMyProfile } from '../api/patients'
import { getDoctors } from '../api/doctors'
import { useAuthStore } from '../store/authStore'
import { canCreate } from '../lib/permissions'
import { toast } from '../store/toastStore'
import PrescriptionPrintModal from '../components/PrescriptionPrintModal'
import type { Prescription } from '../types/prescription'

export default function PrescriptionsPage() {
  const role = useAuthStore((s) => s.role)
  const patientId = useAuthStore((s) => s.patientId)
  const doctorIdClaim = useAuthStore((s) => s.doctorId)
  const isPatient = role === 'Patient'
  const isDoctor = role === 'Doctor'
  const isAuthorizedToCreate = canCreate(role, 'prescriptions')

  const [selectedPatientId, setSelectedPatientId] = useState(isPatient ? patientId ?? '' : '')
  const [doctorId, setDoctorId] = useState(isDoctor ? doctorIdClaim ?? '' : '')
  const [medicationName, setMedicationName] = useState('')
  const [dosage, setDosage] = useState('')
  const [instructions, setInstructions] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPrescriptionToPrint, setSelectedPrescriptionToPrint] = useState<Prescription | null>(null)
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

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions', activePatientId],
    queryFn: () => getPrescriptionsByPatient(activePatientId),
    enabled: !!activePatientId,
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!activePatientId || !doctorId || !medicationName.trim() || !dosage.trim() || !instructions.trim()) return
    setError(null)
    setIsSubmitting(true)
    try {
      await createPrescription({
        patientId: activePatientId,
        doctorId,
        medicationName: medicationName.trim(),
        dosage: dosage.trim(),
        instructions: instructions.trim(),
      })
      queryClient.invalidateQueries({ queryKey: ['prescriptions', activePatientId] })
      setMedicationName('')
      setDosage('')
      setInstructions('')
      toast.success('Medical prescription issued successfully!')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: string } })?.response?.data ?? 'Failed to create prescription.'
      setError(typeof message === 'string' ? message : 'Failed to create prescription.')
      toast.error('Failed to issue prescription.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isPatient ? 'My Prescriptions' : 'Medical Prescriptions'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isPatient
              ? 'View medications, dosage instructions and physician notes prescribed for your treatment.'
              : 'Issue prescriptions, medication dosages and pharmaceutical instructions to patients.'}
          </p>
        </div>
      </div>

      {/* Patient Selector (for Doctors/Admin/Staff) */}
      {!isPatient && (
        <div className="app-card p-6">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Patient to View or Issue Prescriptions
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

      {/* Patient chip for Patient role */}
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
          {/* Create Prescription Form (Doctor / Admin) */}
          {isAuthorizedToCreate && (
            <div className="app-card p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  Rx
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Issue New Prescription</h2>
                  <p className="text-xs text-slate-500">Record dosage, frequency and instructions for patient</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                {!isDoctor && (
                  <div className="max-w-md">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Prescribing Physician *
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Medication Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Amoxicillin, Ibuprofen, Paracetamol"
                      value={medicationName}
                      onChange={(e) => setMedicationName(e.target.value)}
                      className="app-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Dosage Specification *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 500mg, 1 tablet twice daily"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      className="app-input"
                      required
                    />
                  </div>
                </div>

                {/* Intelligent Clinical Allergy Warning */}
                {medicationName.trim().length > 2 &&
                  (medicationName.toLowerCase().includes('amoxicillin') ||
                    medicationName.toLowerCase().includes('penicillin') ||
                    medicationName.toLowerCase().includes('aspirin') ||
                    medicationName.toLowerCase().includes('sulfa') ||
                    medicationName.toLowerCase().includes('ibuprofen') ||
                    medicationName.toLowerCase().includes('codeine')) && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5 animate-fade-in">
                      <span className="text-base shrink-0">⚠️</span>
                      <div className="space-y-0.5">
                        <p className="font-bold">Clinical Safety Advisory (Allergy Screen):</p>
                        <p className="leading-relaxed">
                          <strong>{medicationName}</strong> carries high potential for hypersensitivity reactions (Beta-Lactam / NSAID class). Confirm patient chart has zero recorded allergies before dispensing.
                        </p>
                      </div>
                    </div>
                  )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Usage Instructions & Guidelines *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Take after meals with a glass of water for 7 days."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                    {error}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Issuing...' : 'Create Prescription'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Prescriptions History Table */}
          <div className="app-card overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Prescription History</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                {prescriptions?.length ?? 0} prescriptions
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-400">Loading prescriptions...</div>
            ) : !prescriptions || prescriptions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No prescriptions recorded for this patient.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">Medication</th>
                      <th className="table-header">Dosage</th>
                      <th className="table-header">Usage Instructions</th>
                      <th className="table-header">Prescribing Doctor</th>
                      <th className="table-header">Prescribed Date</th>
                      <th className="table-header text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prescriptions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="table-cell font-bold text-slate-900">{p.medicationName}</td>
                        <td className="table-cell">
                          <span className="font-semibold px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs">
                            {p.dosage}
                          </span>
                        </td>
                        <td className="table-cell text-slate-700 max-w-sm">{p.instructions}</td>
                        <td className="table-cell text-slate-700 font-medium">Dr. {p.doctorName}</td>
                        <td className="table-cell text-slate-500 text-xs font-mono">
                          {new Date(p.prescribedAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="table-cell text-right">
                          <button
                            onClick={() => setSelectedPrescriptionToPrint(p)}
                            className="h-8 px-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all"
                            title="Print Prescription"
                          >
                            🖨️ Print Rx
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Printable Prescription Modal */}
      <PrescriptionPrintModal
        prescription={selectedPrescriptionToPrint}
        patientName={activePatientName}
        isOpen={!!selectedPrescriptionToPrint}
        onClose={() => setSelectedPrescriptionToPrint(null)}
      />
    </div>
  )
}