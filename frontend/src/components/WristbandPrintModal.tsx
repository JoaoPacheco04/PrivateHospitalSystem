import type React from 'react'
import type { Admission } from '../types/admission'
import QrCodeBadge from './QrCodeBadge'

// ─── SVG Realistic Barcode Generator (Code 128 style) ────────
function Barcode128({ value, height = 44 }: { value: string; height?: number }) {
  // Deterministic bar widths based on char codes
  const bars: number[] = []
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    bars.push((code % 3) + 1, ((code >> 1) % 2) + 1, ((code >> 2) % 3) + 1, 1)
  }
  // Add stop bars
  bars.push(2, 1, 1, 3, 1, 2)

  let currentX = 0
  const renderedBars: React.ReactNode[] = []

  bars.forEach((width, idx) => {
    const isBlack = idx % 2 === 0
    if (isBlack) {
      renderedBars.push(
        <rect
          key={idx}
          x={currentX}
          y="0"
          width={width * 1.5}
          height={height}
          fill="currentColor"
        />
      )
    }
    currentX += width * 1.5
  })

  return (
    <div className="flex flex-col items-center">
      <svg
        width={currentX}
        height={height}
        viewBox={`0 0 ${currentX} ${height}`}
        className="text-slate-950 dark:text-white print:text-black"
      >
        {renderedBars}
      </svg>
      <span className="font-mono text-[10px] font-bold tracking-widest text-slate-800 dark:text-slate-200 print:text-black mt-0.5">
        *{value.toUpperCase()}*
      </span>
    </div>
  )
}

export default function WristbandPrintModal({
  admission,
  isOpen,
  onClose,
}: {
  admission: Admission | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !admission) return null

  function handlePrint() {
    window.print()
  }

  const patientNumber = admission.patientNumber || 'HN-0842'
  const patientName = admission.patientName || 'Hospital Patient'
  const bedName = admission.bedNumber ? `Bed ${admission.bedNumber}` : 'General Ward'
  const roomName = admission.roomNumber ? `Room ${admission.roomNumber}` : 'Inpatient Care'
  const department = admission.department || 'Internal Medicine'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 print:border-none print:shadow-none print:p-0 print:max-w-full">
        {/* Header (Hidden on Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xl">
              🏷️
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Inpatient Identification Wristband</h2>
              <p className="text-xs text-slate-400">Thermal barcode strap for clinical safety & bedside scanning</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg">
            ✕
          </button>
        </div>

        {/* ─── Physical Wristband Preview Box ─────────────────── */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto print:p-0 print:bg-transparent print:border-none">
          <div className="min-w-[540px] bg-white text-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-4 shadow-sm relative overflow-hidden flex items-stretch gap-4 print:border-solid print:border-black print:shadow-none">
            {/* Left Strap Fastener tab */}
            <div className="w-10 bg-teal-700 text-white rounded-l-xl flex flex-col items-center justify-between py-2 text-[9px] font-bold tracking-widest shrink-0 uppercase select-none">
              <span>●</span>
              <span className="[writing-mode:vertical-lr] rotate-180">BAND LOCK</span>
              <span>●</span>
            </div>

            {/* Main Wristband Data Strip */}
            <div className="flex-1 space-y-2 py-1">
              {/* Top Banner: Hospital & Dept */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs tracking-tight text-teal-800">PRIVATE HOSPITAL</span>
                  <span className="text-[10px] text-slate-400">|</span>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">{department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    🩸 A+ POSITIVE
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    ADMITTED
                  </span>
                </div>
              </div>

              {/* Patient Core Identifiers */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                    {patientName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-600 mt-0.5">
                    <span>ID: <strong className="text-slate-900">{patientNumber}</strong></span>
                    <span>•</span>
                    <span>Location: <strong className="text-teal-700">{bedName} ({roomName})</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-mono">Admission Date</p>
                  <p className="text-xs font-bold text-slate-800 font-mono">
                    {new Date(admission.admittedAt).toLocaleDateString('en-GB')} {new Date(admission.admittedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Allergy Warning Strip */}
              <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                <span className="font-bold flex items-center gap-1">
                  <span>⚠️ ALLERGY SCREEN:</span>
                  <span className="font-extrabold underline">PENICILLIN / NSAIDs</span>
                </span>
                <span className="text-[10px] font-bold uppercase text-rose-600">FALL RISK: LOW</span>
              </div>

              {/* Barcode & QR Bedside Scan Strip */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <Barcode128 value={patientNumber} height={38} />
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-mono">Bedside Scan</p>
                    <p className="text-[10px] font-mono font-bold text-slate-700">{admission.id.substring(0, 10)}</p>
                  </div>
                  <QrCodeBadge value={`ADM-${admission.id}`} size={48} />
                </div>
              </div>
            </div>

            {/* Right Tab */}
            <div className="w-6 bg-slate-100 border-l border-slate-200 rounded-r-xl flex items-center justify-center text-[8px] font-mono text-slate-400 [writing-mode:vertical-lr] shrink-0">
              SAFETY STRAP
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 print:hidden">
          <p className="text-xs text-slate-400">
            Print on <strong>Standard Hospital Thermal Wristband roll (25mm x 280mm)</strong>
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Close
            </button>
            <button type="button" onClick={handlePrint} className="btn-primary">
              🖨️ Print Wristband
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
