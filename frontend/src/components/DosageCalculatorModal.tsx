import { useState } from 'react'

interface DrugFormula {
  name: string
  standardMgPerKg: number
  dosesPerDay: number
  concentrationMgPerMl: number // e.g. 250mg/5mL = 50mg/mL
  maxDailyMg: number
  category: 'Antibiotic' | 'Analgesic' | 'Antipyretic' | 'Emergency'
  unit: string
}

const DRUG_DATABASE: DrugFormula[] = [
  {
    name: 'Amoxicillin (Oral Suspension)',
    standardMgPerKg: 50, // 50mg/kg/day
    dosesPerDay: 3, // TID (every 8h)
    concentrationMgPerMl: 50, // 250mg/5mL
    maxDailyMg: 3000,
    category: 'Antibiotic',
    unit: 'mg',
  },
  {
    name: 'Paracetamol (Syrup)',
    standardMgPerKg: 60, // 15mg/kg/dose * 4 = 60mg/kg/day
    dosesPerDay: 4, // QID (every 6h)
    concentrationMgPerMl: 24, // 120mg/5mL
    maxDailyMg: 4000,
    category: 'Antipyretic',
    unit: 'mg',
  },
  {
    name: 'Ibuprofen (Pediatric Suspension)',
    standardMgPerKg: 30, // 10mg/kg/dose * 3 = 30mg/kg/day
    dosesPerDay: 3, // TID (every 8h)
    concentrationMgPerMl: 20, // 100mg/5mL
    maxDailyMg: 2400,
    category: 'Analgesic',
    unit: 'mg',
  },
  {
    name: 'Azithromycin (Oral Suspension)',
    standardMgPerKg: 10, // 10mg/kg once daily
    dosesPerDay: 1, // QD (every 24h)
    concentrationMgPerMl: 40, // 200mg/5mL
    maxDailyMg: 500,
    category: 'Antibiotic',
    unit: 'mg',
  },
  {
    name: 'Ceftriaxone (IV / IM)',
    standardMgPerKg: 75, // 75mg/kg once daily
    dosesPerDay: 1, // QD
    concentrationMgPerMl: 100, // 1g/10mL reconstituted
    maxDailyMg: 4000,
    category: 'Antibiotic',
    unit: 'mg',
  },
]

export default function DosageCalculatorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [weightKg, setWeightKg] = useState<number>(18)
  const [selectedDrugIndex, setSelectedDrugIndex] = useState<number>(0)

  if (!isOpen) return null

  const drug = DRUG_DATABASE[selectedDrugIndex]
  const rawDailyMg = weightKg * drug.standardMgPerKg
  const finalDailyMg = Math.min(rawDailyMg, drug.maxDailyMg)
  const dosePerIntakeMg = finalDailyMg / drug.dosesPerDay
  const dosePerIntakeMl = dosePerIntakeMg / drug.concentrationMgPerMl

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl">
              💊
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Clinical Dosage Calculator</h2>
              <p className="text-xs text-slate-400">Pediatric & adult weight-adjusted posology</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg">
            ✕
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Medication Formula
            </label>
            <select
              value={selectedDrugIndex}
              onChange={(e) => setSelectedDrugIndex(Number(e.target.value))}
              className="app-select"
            >
              {DRUG_DATABASE.map((d, i) => (
                <option key={d.name} value={i}>
                  {d.name} ({d.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Patient Body Weight:
              </label>
              <span className="font-mono text-sm font-extrabold text-teal-600 dark:text-teal-400">{weightKg} kg</span>
            </div>
            <input
              type="range"
              min="3"
              max="120"
              step="0.5"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Pediatric (3 kg)</span>
              <span>Child (25 kg)</span>
              <span>Adult (70 kg)</span>
              <span>120 kg</span>
            </div>
          </div>
        </div>

        {/* Calculation Result Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60 border border-indigo-100 dark:border-slate-700 space-y-3">
          <p className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
            Calculated Clinical Posology:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Dose per Intake</p>
              <p className="text-xl font-extrabold text-teal-700 dark:text-teal-400">
                {dosePerIntakeMg.toFixed(0)} mg
              </p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                ≈ {dosePerIntakeMl.toFixed(1)} mL
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Frequency</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                {drug.dosesPerDay}x / day
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Every {Math.round(24 / drug.dosesPerDay)} hours
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-indigo-100/60 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex justify-between">
            <span>Total 24h: <strong>{finalDailyMg.toFixed(0)} mg/day</strong></span>
            <span>Safety Max Cap: <strong>{drug.maxDailyMg} mg</strong></span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
