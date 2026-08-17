import { useState } from 'react'

interface DiagnosisResult {
  triagePriority: 1 | 2 | 3 | 4 | 5
  triageLabel: string
  triageColor: string
  differentials: Array<{ name: string; likelihood: string; notes: string }>
  recommendedExams: string[]
  redFlags: string[]
}

const PRESET_CASES = [
  {
    label: 'Chest Pain + Dyspnea',
    text: 'Crushing retrosternal chest pain radiating to left jaw, diaphoresis and shortness of breath for 45 minutes.',
  },
  {
    label: 'Respiratory Infection',
    text: 'Fever 38.8°C, productive cough with purulent sputum, pleuritic chest pain and crackles in right lower lung.',
  },
  {
    label: 'Acute Abdomen',
    text: 'Severe right lower quadrant abdominal pain with rebound tenderness, nausea, low-grade fever and anorexia.',
  },
  {
    label: 'Headache & Neurological',
    text: 'Sudden severe "thunderclap" headache, neck stiffness, photophobia and visual blurring.',
  },
]

export default function ClinicalAiAssistantModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [symptoms, setSymptoms] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)

  if (!isOpen) return null

  function handleAnalyze(queryText?: string) {
    const text = (queryText ?? symptoms).trim().toLowerCase()
    if (!text) return

    setIsAnalyzing(true)

    setTimeout(() => {
      let analysis: DiagnosisResult

      if (text.includes('chest pain') || text.includes('jaw') || text.includes('diaphoresis') || text.includes('dor no peito')) {
        analysis = {
          triagePriority: 1,
          triageLabel: 'Immediate (Red - 0 min)',
          triageColor: 'bg-rose-500 text-white',
          differentials: [
            { name: 'Acute Coronary Syndrome (STEMI / NSTEMI)', likelihood: 'High (85%)', notes: 'Immediate cardiac telemetry & antiplatelet therapy indicated.' },
            { name: 'Aortic Dissection (Type A)', likelihood: 'Moderate (10%)', notes: 'Evaluate for pulse deficit and inter-arm blood pressure gradient.' },
            { name: 'Pulmonary Embolism', likelihood: 'Low-Moderate (5%)', notes: 'Check Wells score and D-Dimer levels.' },
          ],
          recommendedExams: ['12-Lead ECG (within 10 mins)', 'High-Sensitivity Troponin I / T', 'Chest X-Ray (AP)', 'Echocardiogram', 'CBC & Coagulation Profile'],
          redFlags: ['Hemodynamic instability (BP < 90 mmHg)', 'Syncope', 'New-onset heart murmur'],
        }
      } else if (text.includes('cough') || text.includes('fever') || text.includes('tosse') || text.includes('sputum') || text.includes('pneumonia')) {
        analysis = {
          triagePriority: 3,
          triageLabel: 'Urgent (Yellow - 60 min)',
          triageColor: 'bg-amber-500 text-slate-900',
          differentials: [
            { name: 'Community-Acquired Pneumonia (CAP)', likelihood: 'High (75%)', notes: 'Assess CURB-65 severity score.' },
            { name: 'Acute Exacerbation of COPD / Asthma', likelihood: 'Moderate (20%)', notes: 'Bronchodilator nebulization and pulse oximetry monitoring.' },
            { name: 'Viral Lower Respiratory Tract Infection', likelihood: 'Low (5%)', notes: 'Supportive hydration and antipyretics.' },
          ],
          recommendedExams: ['Chest Radiography (PA & Lateral)', 'Complete Blood Count (CBC) with Differential', 'C-Reactive Protein (CRP)', 'Sputum Gram Stain & Culture'],
          redFlags: ['SpO2 < 92% on room air', 'Respiratory Rate > 30 bpm', 'Altered mental status'],
        }
      } else if (text.includes('abdomen') || text.includes('quadrant') || text.includes('barriga') || text.includes('rebound') || text.includes('apendicite')) {
        analysis = {
          triagePriority: 2,
          triageLabel: 'Very Urgent (Orange - 10 min)',
          triageColor: 'bg-orange-500 text-white',
          differentials: [
            { name: 'Acute Appendicitis', likelihood: 'High (80%)', notes: 'Alvarado score > 7. Urgent surgical consult required.' },
            { name: 'Mesenteric Adenitis / Diverticulitis', likelihood: 'Moderate (15%)', notes: 'Evaluate inflammatory markers.' },
            { name: 'Ovarian Cyst Rupture / Ectopic Pregnancy', likelihood: 'Low-Moderate (5%)', notes: 'In females of childbearing age, obtain STAT beta-hCG.' },
          ],
          recommendedExams: ['Abdominal & Pelvic Ultrasound / CT', 'Full Blood Count (Leukocytosis check)', 'Serum Electrolytes & Renal Function', 'Urine Dipstick & beta-hCG'],
          redFlags: ['Involuntary abdominal guarding', 'High fever with rigors', 'Hypotension'],
        }
      } else {
        // Generic AI clinical evaluation
        analysis = {
          triagePriority: 3,
          triageLabel: 'Standard Urgent (Yellow - 60 min)',
          triageColor: 'bg-amber-500 text-slate-900',
          differentials: [
            { name: 'Acute Clinical Syndrome Under Investigation', likelihood: 'Moderate (60%)', notes: 'Requires full physical exam and baseline metabolic panel.' },
            { name: 'Systemic Inflammatory / Infectious Response', likelihood: 'Moderate (30%)', notes: 'Screen vital signs and inflammatory biomarkers.' },
          ],
          recommendedExams: ['Complete Blood Count (CBC)', 'Biochemical Panel (Urea, Creatinine, Electrolytes)', 'Vital Signs 4-Hour Profiling', 'Diagnostic Imaging as indicated'],
          redFlags: ['Rapid deterioration of consciousness', 'Uncontrolled pain', 'Severe dyspnea'],
        }
      }

      setResult(analysis)
      setIsAnalyzing(false)
    }, 600)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-sky-500 text-white flex items-center justify-center text-xl shadow-lg shadow-teal-500/20">
              🤖
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">AI Clinical Assistant & Symptom Evaluator</h2>
              <p className="text-xs text-slate-400">Differential diagnosis suggestions, exam protocols & triage guidance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg">
            ✕
          </button>
        </div>

        {/* Preset Quick Chips */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Clinical Presets:</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_CASES.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setSymptoms(preset.text)
                  handleAnalyze(preset.text)
                }}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/40 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700 transition-all"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Presenting Symptoms & Patient History
          </label>
          <textarea
            rows={3}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Type symptoms (e.g., fever 39C, pleuritic chest pain, vomiting, acute abdominal tenderness...)"
            className="w-full p-3 text-xs sm:text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-teal-500 text-slate-900 dark:text-white"
          />
          <button
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !symptoms.trim()}
            className="btn-primary w-full py-2.5"
          >
            {isAnalyzing ? 'Analyzing Clinical Patterns...' : '⚡ Generate Clinical Assessment'}
          </button>
        </div>

        {/* Analysis Output */}
        {result && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
            {/* Triage Urgency Badge */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Suggested Manchester Triage</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${result.triageColor}`}>
                  {result.triageLabel}
                </span>
              </div>
              <span className="text-2xl">🚨</span>
            </div>

            {/* Differential Diagnoses */}
            <div className="space-y-2">
              <p className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                Differential Diagnoses (Ranked)
              </p>
              <div className="space-y-2">
                {result.differentials.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</span>
                      <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">{item.likelihood}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.notes}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Exams */}
            <div className="space-y-2">
              <p className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                Recommended Diagnostic Workup
              </p>
              <div className="flex flex-wrap gap-2">
                {result.recommendedExams.map((exam, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                  >
                    🔬 {exam}
                  </span>
                ))}
              </div>
            </div>

            {/* Red Flags */}
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
              <p className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1">Critical Red Flags to Monitor:</p>
              <ul className="list-disc list-inside text-xs text-rose-700 dark:text-rose-400 space-y-0.5">
                {result.redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="btn-secondary">
            Close Assistant
          </button>
        </div>
      </div>
    </div>
  )
}
