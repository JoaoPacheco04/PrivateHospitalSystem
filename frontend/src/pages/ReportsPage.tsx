import { useQuery } from '@tanstack/react-query'
import { getPatients } from '../api/patients'
import { getInvoicesByPatient } from '../api/invoices'
import { getBeds } from '../api/beds'
import { getDoctors } from '../api/doctors'

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  badge,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  badge?: { label: string; bg: string }
}) {
  return (
    <div className="app-card p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <span className="text-2xl">{icon}</span>
        {badge && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badge.bg}`}>
            {badge.label}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const { data: patientsResult } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => getPatients(1, 100),
  })

  const { data: beds } = useQuery({ queryKey: ['beds'], queryFn: getBeds })
  const { data: doctors } = useQuery({ queryKey: ['doctors'], queryFn: getDoctors })

  const { data: allInvoices, isLoading } = useQuery({
    queryKey: ['reports', 'invoices', patientsResult?.items.map((p) => p.id)],
    queryFn: async () => {
      if (!patientsResult) return []
      const results = await Promise.all(
        patientsResult.items.map((p) => getInvoicesByPatient(p.id))
      )
      return results.flat()
    },
    enabled: !!patientsResult,
  })

  const totalRevenue =
    allInvoices
      ?.filter((i) => i.status === 'Paid')
      .reduce((sum, i) => sum + i.patientAmount, 0) ?? 0

  const pendingRevenue =
    allInvoices
      ?.filter((i) => i.status === 'Pending')
      .reduce((sum, i) => sum + i.patientAmount, 0) ?? 0

  const totalInsuranceCovered =
    allInvoices?.reduce((sum, i) => sum + i.insuranceCoveredAmount, 0) ?? 0

  const occupiedBeds = beds?.filter((b) => b.status === 'Occupied').length ?? 0
  const totalBeds = beds?.length ?? 0
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

  const sortedInvoices = [...(allInvoices ?? [])].sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Executive Analytics & Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Financial performance, occupancy metrics and billing audits across hospital operations.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Collected Revenue"
          value={`€${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Direct patient paid receipts"
          icon="💰"
          badge={{ label: 'Settled', bg: 'bg-emerald-50 text-emerald-700' }}
        />
        <MetricCard
          title="Pending Receivables"
          value={`€${pendingRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Unpaid issued invoices"
          icon="⏳"
          badge={{ label: 'Outstanding', bg: 'bg-amber-50 text-amber-700' }}
        />
        <MetricCard
          title="Insurance Payouts"
          value={`€${totalInsuranceCovered.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Third-party insurance claims"
          icon="🛡️"
          badge={{ label: 'Covered', bg: 'bg-teal-50 text-teal-700' }}
        />
        <MetricCard
          title="Bed Occupancy"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedBeds} of ${totalBeds} total beds`}
          icon="🛏️"
          badge={{
            label: occupancyRate > 80 ? 'High' : 'Normal',
            bg: occupancyRate > 80 ? 'bg-rose-50 text-rose-700' : 'bg-sky-50 text-sky-700',
          }}
        />
      </div>

      {/* Resource Allocation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="app-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Staffing Capacity</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{doctors?.length ?? 0} Physicians</p>
          <p className="text-xs text-slate-400 mt-1">Active medical practitioners on staff</p>
        </div>

        <div className="app-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Registered Patients</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{patientsResult?.totalCount ?? 0} Records</p>
          <p className="text-xs text-slate-400 mt-1">Patient files in medical archive</p>
        </div>

        <div className="app-card p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Billed Volume</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            €{(totalRevenue + pendingRevenue + totalInsuranceCovered).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-slate-400 mt-1">Cumulative hospital billings</p>
        </div>
      </div>

      {/* Financial Audit Table */}
      <div className="app-card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Financial Billing Transactions Log</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {allInvoices?.length ?? 0} records
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Aggregating hospital financial data...</div>
        ) : !sortedInvoices || sortedInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No transaction records available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">Procedure</th>
                  <th className="table-header">Total Amount</th>
                  <th className="table-header">Insurance Share</th>
                  <th className="table-header">Patient Amount</th>
                  <th className="table-header">Issue Date</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="table-cell font-bold text-slate-900">{inv.procedureType}</td>
                    <td className="table-cell font-semibold text-slate-800">€{inv.totalAmount.toFixed(2)}</td>
                    <td className="table-cell text-slate-600">€{inv.insuranceCoveredAmount.toFixed(2)}</td>
                    <td className="table-cell font-bold text-slate-900">€{inv.patientAmount.toFixed(2)}</td>
                    <td className="table-cell text-slate-500 text-xs font-mono">
                      {new Date(inv.issuedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            inv.status === 'Paid' ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                        />
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}