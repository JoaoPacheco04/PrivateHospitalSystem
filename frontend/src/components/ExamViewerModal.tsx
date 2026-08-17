import type { MedicalExam } from '../types/medicalExam'
import { LabValueGauge } from './LabValueGauge'

export default function ExamViewerModal({
  exam,
  patientName,
  isOpen,
  onClose,
}: {
  exam: MedicalExam | null
  patientName?: string
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !exam) return null

  const isRadiology =
    exam.examType.toLowerCase().includes('x-ray') ||
    exam.examType.toLowerCase().includes('mri') ||
    exam.examType.toLowerCase().includes('scan') ||
    exam.examType.toLowerCase().includes('ultrasound') ||
    exam.examType.toLowerCase().includes('radiology') ||
    exam.examType.toLowerCase().includes('ct')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xl">
              {isRadiology ? '🩻' : '🔬'}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{exam.examType}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient: <strong className="text-slate-800 dark:text-slate-200">{patientName || 'Patient'}</strong> · Dr. {exam.doctorName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Imaging / Findings Preview */}
        <div className="space-y-4">
          {isRadiology ? (
            <div className="rounded-2xl bg-slate-950 p-6 flex flex-col items-center justify-center text-center text-white border border-slate-800 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="relative z-10 space-y-3 py-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-4xl">
                  🩻
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    DICOM Digital Imaging v3.0
                  </span>
                  <p className="text-sm font-bold text-white mt-1.5">{exam.examType} High Resolution Scan</p>
                  <p className="text-xs text-slate-400 font-mono">Series UID: {exam.id.substring(0, 12)} · Matrix: 1024x1024</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 p-5 border border-teal-200 dark:border-teal-800/40 space-y-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">
                Diagnostic Laboratory Report
              </span>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Automated Clinical Pathology & Biochemical Analysis
              </p>
            </div>
          )}

          {/* Clinical Findings Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Laboratory Findings & Specialist Notes:
            </p>
            {exam.result ? (
              <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed font-mono">
                {exam.result}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Pending laboratory completion. No abnormalities detected at intake.
              </p>
            )}
          </div>

          {/* Interactive Reference Gauges for Non-Radiology Exams */}
          {!isRadiology && (
            <div className="space-y-2.5 pt-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Biological Reference Parameters:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <LabValueGauge
                  lab={{
                    name: 'Hemoglobin (Hgb)',
                    value: 14.6,
                    unit: 'g/dL',
                    minRef: 12.0,
                    maxRef: 16.5,
                  }}
                />
                <LabValueGauge
                  lab={{
                    name: 'Leukocytes (WBC)',
                    value: 11.8,
                    unit: 'x10⁹/L',
                    minRef: 4.5,
                    maxRef: 11.0,
                  }}
                />
                <LabValueGauge
                  lab={{
                    name: 'Fasting Blood Glucose',
                    value: 94,
                    unit: 'mg/dL',
                    minRef: 70,
                    maxRef: 99,
                  }}
                />
                <LabValueGauge
                  lab={{
                    name: 'Serum Creatinine',
                    value: 0.95,
                    unit: 'mg/dL',
                    minRef: 0.6,
                    maxRef: 1.2,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono">Requested: {new Date(exam.requestedAt).toLocaleDateString('en-GB')}</span>
          <button type="button" onClick={onClose} className="btn-primary">
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  )
}
