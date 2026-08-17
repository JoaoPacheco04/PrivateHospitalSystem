import { useQuery } from '@tanstack/react-query'
import { getAppointments } from '../api/appointments'
import { getPrescriptionsByPatient } from '../api/prescriptions'
import { getExamsByPatient } from '../api/medicalExams'
import type { Patient } from '../types/patient'
import QrCodeBadge from './QrCodeBadge'

export default function MedicalReportPrintModal({
  patient,
  isOpen,
  onClose,
}: {
  patient: Patient | null
  isOpen: boolean
  onClose: () => void
}) {
  const patientId = patient?.id ?? ''

  const { data: appointments } = useQuery({
    queryKey: ['appointments', 'patient-report', patientId],
    queryFn: getAppointments,
    enabled: isOpen && !!patientId,
  })

  const { data: prescriptions } = useQuery({
    queryKey: ['prescriptions', 'patient-report', patientId],
    queryFn: () => getPrescriptionsByPatient(patientId),
    enabled: isOpen && !!patientId,
  })

  const { data: exams } = useQuery({
    queryKey: ['exams', 'patient-report', patientId],
    queryFn: () => getExamsByPatient(patientId),
    enabled: isOpen && !!patientId,
  })

  if (!isOpen || !patient) return null

  function handlePrint() {
    window.print()
  }

  const patientAppts = appointments?.filter((a) => a.patientId === patient.id) ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto print:max-h-full print:border-none print:shadow-none print:p-0 print:overflow-visible">
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xl">
              📄
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Comprehensive Clinical Medical Report</h2>
              <p className="text-xs text-slate-400">Official medical summary file ready for print / PDF export</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg">
            ✕
          </button>
        </div>

        {/* ─── Printable Medical Dossier Document ───────────────── */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Hospital Official Letterhead */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-teal-800">PRIVATE HOSPITAL</h1>
              <p className="text-xs font-semibold text-slate-600">Department of Clinical Records & Inpatient Services</p>
              <p className="text-[11px] text-slate-400">SNS Certified Healthcare Unit · Lisbon, Portugal</p>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg font-mono text-xs font-bold uppercase">
                  Confidential Medical Record
                </span>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Issued: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <QrCodeBadge value={`PAT-${patient.id}`} size={56} />
            </div>
          </div>

          {/* Patient Demographics & Health Profile */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Name</p>
              <p className="font-extrabold text-sm text-slate-900">{patient.fullName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient ID</p>
              <p className="font-bold text-teal-800 font-mono">{patient.patientNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date of Birth / Gender</p>
              <p className="font-bold text-slate-800">
                {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-GB') : '—'} ({patient.gender || '—'})
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Insurance Plan</p>
              <p className="font-bold text-slate-800">{patient.insuranceProviderName || 'Private Pay'}</p>
            </div>
          </div>

          {/* Allergies & Precautions Alert */}
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              <span>⚠️ KNOWN ALLERGIES:</span>
              <span className="font-extrabold">{patient.allergies || 'No known drug allergies recorded'}</span>
            </span>
            {patient.medicalNotes && (
              <span className="text-[11px] text-rose-800 italic truncate max-w-xs">
                Notes: {patient.medicalNotes}
              </span>
            )}
          </div>

          {/* Active Prescriptions Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              1. Active Prescribed Medications
            </h3>
            {!prescriptions || prescriptions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active prescriptions recorded.</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase">
                    <th className="py-1">Medication</th>
                    <th className="py-1">Dosage & Frequency</th>
                    <th className="py-1">Instructions</th>
                    <th className="py-1 text-right">Prescribed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescriptions.map((p) => (
                    <tr key={p.id}>
                      <td className="py-1.5 font-bold text-slate-900">{p.medicationName}</td>
                      <td className="py-1.5 font-mono text-teal-800">{p.dosage}</td>
                      <td className="py-1.5 text-slate-600">{p.instructions || 'Standard'}</td>
                      <td className="py-1.5 text-right font-mono text-slate-500">
                        {new Date(p.prescribedAt).toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Diagnostic & Lab Exams */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              2. Diagnostic Imaging & Laboratory Findings
            </h3>
            {!exams || exams.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No diagnostic exams on file.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {exams.map((e) => (
                  <div key={e.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{e.examType}</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(e.requestedAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-mono">{e.result || 'Awaiting lab validation'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Consultations */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. Recent Consultations & Clinical Follow-ups
            </h3>
            <p className="text-xs text-slate-600">
              Total Recorded Visits: <strong>{patientAppts.length} consultations</strong> · Follow-up care scheduled in Outpatient Clinic.
            </p>
          </div>

          {/* Signature and Physician Certification Footer */}
          <div className="pt-8 mt-6 border-t-2 border-slate-900 flex items-end justify-between text-xs">
            <div>
              <p className="text-[10px] text-slate-500">Certified by Hospital Information System (HIS)</p>
              <p className="text-[10px] font-mono text-slate-400">Doc Digest: {patient.id.substring(0, 16).toUpperCase()}</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-b border-slate-900 pb-1 font-serif italic text-xs text-slate-700">
                Medical Directorate
              </div>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                Physician Signature & Stamp
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions (Hidden on Print) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 print:hidden">
          <p className="text-xs text-slate-400">
            Formatted for <strong>A4 / Letter Hospital Medical Record Export</strong>
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Close
            </button>
            <button type="button" onClick={handlePrint} className="btn-primary">
              🖨️ Print Clinical Dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
