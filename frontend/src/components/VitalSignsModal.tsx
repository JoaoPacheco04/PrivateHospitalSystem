import { useState } from 'react'
import { toast } from '../store/toastStore'

export interface VitalSignRecord {
  id: string
  systolic: number
  diastolic: number
  heartRate: number
  temperature: number
  oxygenSaturation: number
  recordedAt: string
  notes?: string
}

export default function VitalSignsModal({
  isOpen,
  patientName,
  onClose,
  onRecordAdded,
}: {
  isOpen: boolean
  patientName?: string
  onClose: () => void
  onRecordAdded: (record: VitalSignRecord) => void
}) {
  const [systolic, setSystolic] = useState<number | ''>(120)
  const [diastolic, setDiastolic] = useState<number | ''>(80)
  const [heartRate, setHeartRate] = useState<number | ''>(72)
  const [temperature, setTemperature] = useState<number | ''>(36.6)
  const [oxygenSaturation, setOxygenSaturation] = useState<number | ''>(98)
  const [notes, setNotes] = useState('')

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!systolic || !diastolic || !heartRate || !temperature || !oxygenSaturation) {
      toast.error('Please enter all vital parameters.')
      return
    }

    const record: VitalSignRecord = {
      id: Math.random().toString(36).substring(2, 9),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      heartRate: Number(heartRate),
      temperature: Number(temperature),
      oxygenSaturation: Number(oxygenSaturation),
      recordedAt: new Date().toISOString(),
      notes: notes.trim() || undefined,
    }

    onRecordAdded(record)
    toast.success('Vital signs registered successfully!')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 font-bold flex items-center justify-center text-xl">
            🩺
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Record Vital Signs (Triage & Monitoring)</h2>
            <p className="text-xs text-slate-500">Patient: {patientName || 'Patient'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Blood Pressure (Systolic)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  max="250"
                  placeholder="120"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value === '' ? '' : Number(e.target.value))}
                  className="app-input pr-14 font-mono font-bold"
                  required
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400 font-bold">mmHg</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Blood Pressure (Diastolic)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="150"
                  placeholder="80"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value === '' ? '' : Number(e.target.value))}
                  className="app-input pr-14 font-mono font-bold"
                  required
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400 font-bold">mmHg</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Heart Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="220"
                  placeholder="72"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="app-input pr-12 font-mono font-bold"
                  required
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400 font-bold">BPM</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Body Temp
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="45"
                  placeholder="36.6"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value === '' ? '' : Number(e.target.value))}
                  className="app-input pr-10 font-mono font-bold"
                  required
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400 font-bold">°C</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Oxygen (SpO2)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  max="100"
                  placeholder="98"
                  value={oxygenSaturation}
                  onChange={(e) => setOxygenSaturation(e.target.value === '' ? '' : Number(e.target.value))}
                  className="app-input pr-8 font-mono font-bold"
                  required
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Clinical Observations / Nurse Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Patient resting comfortably, regular sinus rhythm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="app-input"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary bg-rose-600 hover:bg-rose-700">
              Save Vital Signs
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
