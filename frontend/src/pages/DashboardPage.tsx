import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getDashboard } from '../api/dashboard'
import { getMyProfile } from '../api/patients'
import { getAppointments } from '../api/appointments'
import { getPrescriptionsByPatient } from '../api/prescriptions'
import { getInvoicesByPatient } from '../api/invoices'
import { useAuthStore } from '../store/authStore'
import { useLanguageStore } from '../store/languageStore'
import { RevenueTrendBarChart, TriageDistributionDonut } from '../components/DashboardCharts'
import type { DashboardData } from '../types/dashboard'

// ─── Modern Stat Card ─────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  color = 'teal',
  subtext,
}: {
  label: string
  value: string | number
  icon: string
  color?: 'teal' | 'violet' | 'sky' | 'amber' | 'rose' | 'emerald'
  subtext?: string
}) {
  const colorMap = {
    teal: { icon: 'bg-teal-500/10 text-teal-600 dark:text-teal-400' },
    violet: { icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
    sky: { icon: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
    amber: { icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    rose: { icon: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
    emerald: { icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  }
  const c = colorMap[color]
  return (
    <div className="app-card p-5 flex items-start gap-4 hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-2xl ${c.icon} flex items-center justify-center shrink-0`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">{value}</p>
        {subtext && <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">{subtext}</p>}
      </div>
    </div>
  )
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

// ─── Admin / Staff Dashboard ──────────────────────────────────
function AdminDashboard({ data }: { data: DashboardData }) {
  const isAdmin = useAuthStore((s) => s.role) === 'Admin'
  const t = useLanguageStore((s) => s.t)

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div>
        <SectionHeading title={t('dash.facilitiesTitle')} subtitle={t('dash.facilitiesSub')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t('dash.totalPatients')}
            value={data.totalPatients}
            color="sky"
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            subtext={t('dash.totalPatientsSub')}
          />
          <StatCard
            label={t('dash.totalDoctors')}
            value={data.totalDoctors}
            color="teal"
            icon="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            subtext={t('dash.totalDoctorsSub')}
          />
          <StatCard
            label={t('dash.availableBeds')}
            value={`${data.availableBeds} / ${data.totalBeds}`}
            color="emerald"
            icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            subtext={`${data.occupiedBeds} ${t('dash.availableBedsSub')}`}
          />
          <StatCard
            label={t('dash.activeAdmissions')}
            value={data.activeAdmissions}
            color="violet"
            icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            subtext={t('dash.activeAdmissionsSub')}
          />
        </div>
      </div>

      {/* Daily Activity */}
      <div>
        <SectionHeading title={t('dash.todayActivity')} subtitle={t('dash.todayActivitySub')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t('dash.consultationsToday')}
            value={data.appointmentsToday}
            color="teal"
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            subtext={t('dash.consultationsTodaySub')}
          />
          <StatCard
            label={t('dash.emergencyQueue')}
            value={data.emergencyQueueCount}
            color="rose"
            icon="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            subtext={t('dash.emergencyQueueSub')}
          />
          <StatCard
            label={t('dash.upcomingSurgeries')}
            value={data.upcomingSurgeriesCount}
            color="amber"
            icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            subtext={t('dash.upcomingSurgeriesSub')}
          />
          <StatCard
            label={t('dash.pendingReferrals')}
            value={data.pendingReferralsCount}
            color="sky"
            icon="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8"
            subtext={t('dash.pendingReferralsSub')}
          />
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueTrendBarChart revenue={data.totalRevenue} pending={data.pendingRevenue} />
        <TriageDistributionDonut
          red={data.emergencyQueueCount > 0 ? 1 : 0}
          orange={Math.max(0, data.emergencyQueueCount - 1)}
          total={data.emergencyQueueCount}
        />
      </div>

      {/* Admin Financial Analytics */}
      {isAdmin && (
        <div>
          <SectionHeading title={t('dash.financialTitle')} subtitle={t('dash.financialSub')} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label={t('dash.totalBilled')}
              value={`€${data.totalRevenue.toFixed(2)}`}
              color="emerald"
              icon="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
              subtext={t('dash.totalBilledSub')}
            />
            <StatCard
              label={t('dash.unpaidInvoices')}
              value={`€${data.pendingRevenue.toFixed(2)}`}
              color="amber"
              icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              subtext={t('dash.unpaidInvoicesSub')}
            />
            <StatCard
              label="Low Stock Medicines"
              value={data.lowStockMedicationsCount}
              color="rose"
              icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              subtext="Items below minimum alert threshold"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Doctor Dashboard ─────────────────────────────────────────
function DoctorDashboard({ data }: { data: DashboardData }) {
  const t = useLanguageStore((s) => s.t)

  return (
    <div className="space-y-8">
      <div>
        <SectionHeading title="My Clinical Schedule" subtitle="Your daily patient appointments, scheduled surgeries and consults" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label={t('dash.consultationsToday')}
            value={data.appointmentsToday}
            color="teal"
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            subtext="Patients on your daily roster"
          />
          <StatCard
            label={t('dash.upcomingSurgeries')}
            value={data.upcomingSurgeriesCount}
            color="violet"
            icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            subtext="Assigned theatre operations"
          />
          <StatCard
            label={t('dash.pendingReferrals')}
            value={data.pendingReferralsCount}
            color="sky"
            icon="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8"
            subtext="Awaiting your clinical review"
          />
        </div>
      </div>
    </div>
  )
}

// ─── Patient Dashboard ────────────────────────────────────────
function PatientDashboard() {
  const patientId = useAuthStore((s) => s.patientId)
  const fullName = useAuthStore((s) => s.fullName)
  const t = useLanguageStore((s) => s.t)

  const { data: profile } = useQuery({
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

  const upcomingAppts = appointments?.filter((a) => a.status === 'Scheduled') ?? []
  const activePrescriptions = prescriptions ?? []
  const pendingInvoices = invoices?.filter((i) => i.status === 'Issued') ?? []

  return (
    <div className="space-y-8">
      {/* Patient Hero Card */}
      <div className="app-card p-6 sm:p-8 bg-gradient-to-r from-teal-800 to-slate-900 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/30 border border-teal-400/40 flex items-center justify-center text-teal-200 text-2xl font-extrabold">
              {(profile?.fullName ?? fullName ?? 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-teal-200/80 text-xs font-semibold">Welcome back,</p>
              <h2 className="text-2xl font-bold">{profile?.fullName ?? fullName ?? 'Patient'}</h2>
              <p className="text-xs text-teal-200/70 font-mono mt-0.5">Patient #{profile?.patientNumber ?? 'HN-0000'}</p>
            </div>
          </div>

          <Link
            to="/appointments/new"
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 text-xs font-bold rounded-xl shadow-lg transition-all self-start sm:self-auto"
          >
            {t('app.bookAppt')}
          </Link>
        </div>
      </div>

      {/* Patient Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label={t('nav.myAppts')}
          value={upcomingAppts.length}
          color="teal"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          subtext="Upcoming scheduled consultations"
        />
        <StatCard
          label={t('nav.myPrescriptions')}
          value={activePrescriptions.length}
          color="sky"
          icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          subtext="Active prescribed medications"
        />
        <StatCard
          label={t('nav.myInvoices')}
          value={pendingInvoices.length}
          color="amber"
          icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          subtext="Invoices pending settlement"
        />
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────
export default function DashboardPage() {
  const role = useAuthStore((s) => s.role)
  const t = useLanguageStore((s) => s.t)

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    enabled: role !== 'Patient',
  })

  if (role === 'Patient') {
    return <PatientDashboard />
  }

  if (isLoading) {
    return (
      <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <svg className="w-8 h-8 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm font-semibold">{t('app.loading')}</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl">
        Failed to load dashboard data. Ensure backend service is running.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('dash.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('dash.subtitle')}
          </p>
        </div>
      </div>

      {(role === 'Admin' || role === 'Staff') && <AdminDashboard data={data} />}
      {role === 'Doctor' && <DoctorDashboard data={data} />}
    </div>
  )
}