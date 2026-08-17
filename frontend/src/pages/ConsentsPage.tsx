import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getConsentsByPatient, createInformedConsent, signConsent } from '../api/consents'
import { getPatients, getMyProfile } from '../api/patients'
import { getDoctors } from '../api/doctors'
import { useAuthStore } from '../store/authStore'
import { canCreate } from '../lib/permissions'
import { toast } from '../store/toastStore'

export default function ConsentsPage() {
  const role = useAuthStore((s) => s.role)
  const patientId = useAuthStore((s) => s.patientId)
  const doctorIdClaim = useAuthStore((s) => s.doctorId)
  const isPatient = role === 'Patient'
  const isDoctor = role === 'Doctor'
  const isAuthorizedToCreate = canCreate(role, 'consents') || role === 'Admin' || role === 'Doctor' || role === 'Staff'

  const [selectedPatientId, setSelectedPatientId] = useState(isPatient ? patientId ?? '' : '')
  const [witnessDoctorId, setWitnessDoctorId] = useState(isDoctor ? doctorIdClaim ?? '' : '')
  const [procedureDescription, setProcedureDescription] = useState('')
  const [risksExplained, setRisksExplained] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signingId, setSigningId] = useState<string | null>(null)
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

  const { data: consents, isLoading } = useQuery({
    queryKey: ['consents', activePatientId],
    queryFn: () => getConsentsByPatient(activePatientId),
    enabled: !!activePatientId,
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!activePatientId || !witnessDoctorId || !procedureDescription.trim() || !risksExplained.trim()) return
    setIsSubmitting(true)
    try {
      await createInformedConsent({
        patientId: activePatientId,
        witnessedByDoctorId: witnessDoctorId,
        procedureDescription: procedureDescription.trim(),
        risksExplained: risksExplained.trim(),
      })
      queryClient.invalidateQueries({ queryKey: ['consents', activePatientId] })
      setProcedureDescription('')
      setRisksExplained('')
      toast.success('Informed consent document issued for patient signature!')
    } catch {
      toast.error('Failed to issue informed consent.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSign(id: string) {
    setSigningId(id)
    try {
      await signConsent(id)
      queryClient.invalidateQueries({ queryKey: ['consents', activePatientId] })
      toast.success('Informed consent electronically signed and validated!')
    } catch {
      toast.error('Failed to sign consent.')
    } finally {
      setSigningId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isPatient ? 'My Informed Consents' : 'Informed Medical Consents'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {isPatient
            ? 'Review clinical procedure risks, medical disclosures and electronically sign required consent forms.'
            : 'Issue informed consent documents, declare clinical risks and manage signed patient authorizations.'}
        </p>
      </div>

      {/* Patient Selector */}
      {!isPatient && (
        <div className="app-card p-6">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Patient to View or Issue Consents
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

      {/* Patient Chip */}
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
          {/* Create Consent Form (Staff/Doctor/Admin) */}
          {isAuthorizedToCreate && !isPatient && (
            <div className="app-card p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  ✍️
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Issue Informed Consent Form</h2>
                  <p className="text-xs text-slate-500">Draft procedure details and explained risks for patient signature</p>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                {!isDoctor && (
                  <div className="max-w-md">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Witnessing Doctor *
                    </label>
                    <select
                      value={witnessDoctorId}
                      onChange={(e) => setWitnessDoctorId(e.target.value)}
                      className="app-select"
                      required
                    >
                      <option value="">Select attending doctor...</option>
                      {doctors?.map((d) => (
                        <option key={d.id} value={d.id}>
                          Dr. {d.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Procedure Description & Clinical Scope *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Laparoscopic Cholecystectomy under general anesthesia..."
                    value={procedureDescription}
                    onChange={(e) => setProcedureDescription(e.target.value)}
                    className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Risks, Complications & Post-Op Warnings Explained *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Risk of hemorrhage, infection, anesthesia reactions, and conversion to open surgery..."
                    value={risksExplained}
                    onChange={(e) => setRisksExplained(e.target.value)}
                    className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800"
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Issuing...' : 'Issue Consent Form'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Consents List */}
          <div className="app-card overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Informed Consent Documents</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                {consents?.length ?? 0} documents
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-400">Loading informed consents...</div>
            ) : !consents || consents.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No informed consent forms on file for this patient.</div>
            ) : (
              <div className="p-6 space-y-4">
                {consents.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{c.procedureDescription}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Witnessed by: Dr. {c.witnessedByDoctorName}</p>
                      </div>

                      <div>
                        {c.patientSigned ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            Signed on {new Date(c.signedAt!).toLocaleDateString('en-GB')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                            Pending Patient Signature
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                        Disclosed Risks & Medical Warnings:
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed">{c.risksExplained}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Created: {new Date(c.createdAt).toLocaleDateString('en-GB')}
                      </span>

                      {!c.patientSigned && (
                        <button
                          onClick={() => handleSign(c.id)}
                          disabled={signingId === c.id}
                          className="btn-primary bg-emerald-600 hover:bg-emerald-700 h-9 px-4 text-xs font-bold"
                        >
                          {signingId === c.id ? 'Signing...' : '✍️ Sign Consent Electronically'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
