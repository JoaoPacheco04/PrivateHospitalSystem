import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '../api/dashboard'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  })

  if (isLoading) return <p className="text-slate-500">Loading...</p>
  if (error) return <p className="text-red-600">Failed to load dashboard.</p>
  if (!data) return null

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Patients" value={data.totalPatients} />
        <StatCard label="Total Doctors" value={data.totalDoctors} />
        <StatCard label="Available Beds" value={`${data.availableBeds} / ${data.totalBeds}`} />
        <StatCard label="Active Admissions" value={data.activeAdmissions} />
        <StatCard label="Appointments Today" value={data.appointmentsToday} />
        <StatCard label="Emergency Queue" value={data.emergencyQueueCount} />
        <StatCard label="Upcoming Surgeries" value={data.upcomingSurgeriesCount} />
        <StatCard label="Pending Referrals" value={data.pendingReferralsCount} />
        <StatCard label="Pending Revenue" value={`€${data.pendingRevenue.toFixed(2)}`} />
        <StatCard label="Total Revenue" value={`€${data.totalRevenue.toFixed(2)}`} />
        <StatCard label="Low Stock Meds" value={data.lowStockMedicationsCount} />
        <StatCard label="Avg. Feedback" value={data.averageFeedbackRating.toFixed(1)} />
      </div>
    </div>
  )
}