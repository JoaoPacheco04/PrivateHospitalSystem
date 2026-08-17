import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createDischargeSummary } from '../api/dischargeSummaries'
import { getDoctors } from '../api/doctors'
import { useAuthStore } from '../store/authStore'
import { toast } from '../store/toastStore'

export default function DischargeSummaryModal({
  admissionId,
  patientName,
  isOpen,
  onClose,
  onCompleted,
}: {
  admissionId: string | null
  patientName?: string
  isOpen: boolean
  onClose: () => void
  onCompleted: () => void
}) {
  const role = useAuthStore((s) => s.role)
  const doctorIdClaim = useAuthStore((s) => s.doctorId)
  const isDoctor = role === 'Doctor'

  const [doctorId, setDoctorId] = useState(isDoctor ? doctorIdClaim ?? '' : '')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatmentSummary, setTreatmentSummary] = useState('')
  const [medicationOnDischarge, setMedicationOnDischarge] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: getDoctors,
    enabled: !isDoctor && isOpen,
  })

  if (!isOpen || !admissionId) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!admissionId || !doctorId || !diagnosis.trim() || !treatmentSummary.trim()) {
      toast.error('Please fill in all mandatory clinical fields.')
      return
    }

    setIsSubmitting(true)
    try {
      await createDischargeSummary({
        admissionId,
        issuedByDoctorId: doctorId,
        diagnosis: diagnosis.trim(),
        treatmentSummary: treatmentSummary.trim(),
        medicationOnDischarge: medicationOnDischarge.trim() || undefined,
        followUpDate: followUpDate ? `${followUpDate}T00:00:00` : undefined,
      })
      toast.success('Discharge summary recorded and patient discharged!')
      onCompleted()
      onClose()
    } catch {
      toast.error('Failed to create discharge summary.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-lg">
            📋
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Clinical Discharge Summary</h2>
            <p className="text-xs text-slate-500">Patient: {patientName || 'Inpatient'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isDoctor && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Discharging Physician *
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Final Clinical Diagnosis *
            </label>
            <input
              type="text"
              placeholder="e.g. Acute appendicitis post-laparoscopic appendectomy"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="app-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Inpatient Treatment Summary & Course *
            </label>
            <textarea
              rows={2}
              placeholder="Summary of interventions, clinical progress and resolution..."
              value={treatmentSummary}
              onChange={(e) => setTreatmentSummary(e.target.value)}
              className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Home Medication Plan
              </label>
              <input
                type="text"
                placeholder="e.g. Ciprofloxacin 500mg 5 days"
                value={medicationOnDischarge}
                onChange={(e) => setMedicationOnDischarge(e.target.value)}
                className="app-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Recommended Follow-Up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="app-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Discharging...' : 'Confirm Discharge & Complete Summary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
