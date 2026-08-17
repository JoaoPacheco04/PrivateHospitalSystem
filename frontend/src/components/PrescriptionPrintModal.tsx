import type { Prescription } from '../types/prescription'
import QrCodeBadge from './QrCodeBadge'

export default function PrescriptionPrintModal({
  prescription,
  patientName,
  isOpen,
  onClose,
}: {
  prescription: Prescription | null
  patientName?: string
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !prescription) return null

  function handlePrint() {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 print:border-none print:shadow-none print:max-w-full">
        {/* Hospital Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Private Hospital</h2>
            <p className="text-xs text-slate-500">Official Medical Prescription</p>
            <p className="text-xs text-slate-400">SNS Certified Practice · Lisbon, Portugal</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full font-mono text-xs font-bold">
              Rx MEDICAL
            </span>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Date: {new Date(prescription.prescribedAt).toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>

        {/* Prescription Details */}
        <div className="py-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient</p>
              <p className="text-sm font-bold text-slate-900">{patientName || 'Medical Patient'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prescribing Doctor</p>
              <p className="text-sm font-bold text-slate-900">Dr. {prescription.doctorName}</p>
            </div>
          </div>

          <div className="p-4 border-2 border-dashed border-teal-200 rounded-2xl bg-teal-50/20 space-y-2">
            <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">Prescribed Item</p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-extrabold text-slate-900">{prescription.medicationName}</span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-teal-100 text-teal-800 rounded-md">
                {prescription.dosage}
              </span>
            </div>
            <div className="pt-2 border-t border-teal-100/60">
              <p className="text-xs font-bold text-slate-600">Instructions / Posology:</p>
              <p className="text-xs text-slate-800 mt-0.5 leading-relaxed">{prescription.instructions}</p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200 flex items-end justify-between">
            <div className="flex items-center gap-3">
              <QrCodeBadge value={`RX-${prescription.id}`} size={64} label="Scan Rx" />
              <div>
                <p className="text-[10px] text-slate-400">Valid for 30 days from issue date</p>
                <p className="text-[10px] font-mono text-slate-400">Doc ID: {prescription.id.substring(0, 8)}</p>
                <p className="text-[10px] text-teal-700 font-semibold">SNS e-Prescription Verified</p>
              </div>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 pb-1 font-serif italic text-xs text-slate-600">
                Dr. {prescription.doctorName}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Physician Signature</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 print:hidden">
          <button type="button" onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button type="button" onClick={handlePrint} className="btn-primary">
            🖨️ Print Prescription
          </button>
        </div>
      </div>
    </div>
  )
}
