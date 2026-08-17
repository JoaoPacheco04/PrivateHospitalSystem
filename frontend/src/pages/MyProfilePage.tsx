import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getMyProfile } from '../api/patients'
import { getPrescriptionsByPatient } from '../api/prescriptions'
import { getInvoicesByPatient } from '../api/invoices'
import { getAppointments } from '../api/appointments'
import PatientTimeline from '../components/PatientTimeline'
import VitalSignsModal, { type VitalSignRecord } from '../components/VitalSignsModal'
import QrCodeBadge from '../components/QrCodeBadge'
import MedicalReportPrintModal from '../components/MedicalReportPrintModal'

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-xl">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">{label}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white block">{value}</span>
    </div>
  )
}

export default function MyProfilePage() {
  const patientId = useAuthStore((s) => s.patientId)
  const fullName = useAuthStore((s) => s.fullName)

  const [activeTab, setActiveTab] = useState<'timeline' | 'vitals' | 'summary'>('timeline')
  const [isVitalsOpen, setIsVitalsOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [vitalRecords, setVitalRecords] = useState<VitalSignRecord[]>([
    {
      id: 'init-1',
      systolic: 120,
      diastolic: 80,
      heartRate: 72,
      temperature: 36.6,
      oxygenSaturation: 98,
      recordedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      notes: 'Initial clinical assessment on intake. Normal vital parameters.',
    },
  ])

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
  })

  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  })

  const { data: prescriptions } = useQuery({
    queryKey: ['prescriptions-patient', patientId],
    queryFn: () => getPrescriptionsByPatient(patientId!),
    enabled: !!patientId,
  })

  const { data: invoices } = useQuery({
    queryKey: ['invoices-patient', patientId],
    queryFn: () => getInvoicesByPatient(patientId!),
    enabled: !!patientId,
  })

  if (loadingProfile) {
    return (
      <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <svg className="w-8 h-8 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm font-semibold">Loading your clinical record...</p>
      </div>
    )
  }

  const latestVitals = vitalRecords[0]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Patient Hero Card */}
      <div className="app-card p-6 sm:p-8 bg-gradient-to-r from-teal-800 to-slate-900 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/30 border border-teal-400/40 flex items-center justify-center text-teal-200 text-2xl font-extrabold shadow-inner">
              {(profile?.fullName ?? fullName ?? 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black">{profile?.fullName ?? fullName ?? 'Patient'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-400/20 text-teal-200 border border-teal-400/30">
                  Patient #{profile?.patientNumber ?? 'HN-0000'}
                </span>
              </div>
              <p className="text-teal-200/80 text-xs sm:text-sm mt-1">
                {profile?.email || 'Authenticated Hospital Patient Profile'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-start sm:self-auto">
            <QrCodeBadge value={profile?.patientNumber ?? 'HN-0000'} size={60} label="ID Pass" />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsReportOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-md border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                title="Print Full Official Clinical Dossier"
              >
                <span>📄</span>
                <span>Print Dossier</span>
              </button>

              <button
                onClick={() => setIsVitalsOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span>🩺</span>
                <span>Log Vitals</span>
              </button>

              <Link
                to="/appointments/new"
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-900 text-xs font-bold rounded-xl shadow-md transition-all text-center"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="app-card p-4">
          <p className="text-xs text-slate-500 font-semibold">Scheduled Appointments</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {appointments?.filter((a) => a.status === 'Scheduled').length ?? 0}
          </p>
        </div>
        <div className="app-card p-4">
          <p className="text-xs text-slate-500 font-semibold">Active Prescriptions</p>
          <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">
            {prescriptions?.length ?? 0}
          </p>
        </div>
        <div className="app-card p-4">
          <p className="text-xs text-slate-500 font-semibold">Latest Blood Pressure</p>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 font-mono">
            {latestVitals ? `${latestVitals.systolic}/${latestVitals.diastolic}` : '120/80'} <span className="text-xs font-normal text-slate-400">mmHg</span>
          </p>
        </div>
        <div className="app-card p-4">
          <p className="text-xs text-slate-500 font-semibold">Heart Rate / SpO2</p>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {latestVitals ? `${latestVitals.heartRate} bpm` : '72 bpm'} · {latestVitals ? `${latestVitals.oxygenSaturation}%` : '98%'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'timeline'
              ? 'bg-teal-600 text-white shadow-md'
              : 'app-card text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          📈 Clinical Timeline
        </button>
        <button
          onClick={() => setActiveTab('vitals')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'vitals'
              ? 'bg-teal-600 text-white shadow-md'
              : 'app-card text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          🩺 Vital Signs Tracker ({vitalRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'summary'
              ? 'bg-teal-600 text-white shadow-md'
              : 'app-card text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          🗂️ Demographics & Insurance
        </button>
      </div>

      {/* TAB: TIMELINE */}
      {activeTab === 'timeline' && patientId && (
        <div className="app-card p-6 sm:p-7 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Chronological Medical Events & Encounters
          </h2>
          <PatientTimeline patientId={patientId} />
        </div>
      )}

      {/* TAB: VITALS */}
      {activeTab === 'vitals' && (
        <div className="app-card overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Vital Signs Log History</h2>
            <button
              onClick={() => setIsVitalsOpen(true)}
              className="btn-primary h-9 px-3.5 text-xs font-bold"
            >
              + Record New Vitals
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">Timestamp</th>
                  <th className="table-header">Blood Pressure</th>
                  <th className="table-header">Heart Rate</th>
                  <th className="table-header">Temperature</th>
                  <th className="table-header">Oxygen (SpO2)</th>
                  <th className="table-header">Clinical Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {vitalRecords.map((vr) => (
                  <tr key={vr.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="table-cell font-mono text-xs text-slate-600 dark:text-slate-400">
                      {new Date(vr.recordedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="table-cell font-mono font-bold text-slate-900 dark:text-white">
                      {vr.systolic}/{vr.diastolic} mmHg
                    </td>
                    <td className="table-cell font-mono font-semibold text-rose-600 dark:text-rose-400">
                      {vr.heartRate} bpm
                    </td>
                    <td className="table-cell font-mono font-semibold text-amber-600 dark:text-amber-400">
                      {vr.temperature}°C
                    </td>
                    <td className="table-cell font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {vr.oxygenSaturation}%
                    </td>
                    <td className="table-cell text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {vr.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SUMMARY */}
      {activeTab === 'summary' && (
        <div className="app-card p-6 sm:p-7 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Patient Demographics & Insurance Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <InfoItem label="Full Legal Name" value={profile?.fullName} />
            <InfoItem label="National Healthcare #" value={profile?.patientNumber} />
            <InfoItem label="Email Address" value={profile?.email} />
            <InfoItem label="Phone Number" value={profile?.phoneNumber} />
            <InfoItem label="Birth Date" value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB') : null} />
            <InfoItem label="Gender" value={profile?.gender} />
            <InfoItem label="Blood Type" value={profile?.bloodType} />
            <InfoItem label="Insurance Provider" value={profile?.insuranceProviderName || 'None / Private Pay'} />
            <InfoItem label="Policy / Card #" value={profile?.insurancePolicyNumber} />
            <InfoItem label="Emergency Contact" value={profile?.emergencyContact} />
          </div>
        </div>
      )}

      {/* Vital Signs Modal */}
      <VitalSignsModal
        isOpen={isVitalsOpen}
        patientName={profile?.fullName ?? fullName ?? 'Patient'}
        onClose={() => setIsVitalsOpen(false)}
        onRecordAdded={(rec) => setVitalRecords((prev) => [rec, ...prev])}
      />

      {/* Official Clinical Dossier Report Modal */}
      <MedicalReportPrintModal
        patient={profile ?? null}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  )
}
