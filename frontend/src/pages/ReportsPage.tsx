import { useQuery } from '@tanstack/react-query'
import { getPatients } from '../api/patients'
import { getInvoicesByPatient } from '../api/invoices'
import { getBeds } from '../api/beds'
import { getDoctors } from '../api/doctors'
import type { Invoice } from '../types/invoice'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
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

  const totalRevenue = allInvoices
    ?.filter((i) => i.status === 'Paid')
    .reduce((sum, i) => sum + i.patientAmount, 0) ?? 0

  const pendingRevenue = allInvoices
    ?.filter((i) => i.status === 'Pending')
    .reduce((sum, i) => sum + i.patientAmount, 0) ?? 0

  const totalInsuranceCovered = allInvoices
    ?.reduce((sum, i) => sum + i.insuranceCoveredAmount, 0) ?? 0

  const occupiedBeds = beds?.filter((b) => b.status === 'Occupied').length ?? 0
  const totalBeds = beds?.length ?? 0
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

  const sortedInvoices = [...(allInvoices ?? [])].sort(
    (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-teal-500 rounded-full" />
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue (Paid)" value={`€${totalRevenue.toFixed(2)}`} />
        <StatCard label="Pending Revenue" value={`€${pendingRevenue.toFixed(2)}`} />
        <StatCard label="Insurance Covered" value={`€${totalInsuranceCovered.toFixed(2)}`} />
        <StatCard label="Bed Occupancy" value={`${occupancyRate}% (${occupiedBeds}/${totalBeds})`} />
        <StatCard label="Total Patients" value={patientsResult?.totalCount ?? 0} />
        <StatCard label="Total Doctors" value={doctors?.length ?? 0} />
        <StatCard label="Total Invoices" value={allInvoices?.length ?? 0} />
        <StatCard
          label="Paid Invoices"
          value={allInvoices?.filter((i) => i.status === 'Paid').length ?? 0}
        />
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-3">All Invoices</h2>
      {isLoading ? (
        <p className="text-slate-500">Loading report data...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-teal-50/60 border-b border-teal-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Date</th>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Patient</th>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Procedure</th>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Total</th>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedInvoices.map((inv: Invoice) => (
                <tr key={inv.id} className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors">
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(inv.issuedAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{inv.patientName}</td>
                  <td className="px-4 py-3 text-slate-600">{inv.procedureType}</td>
                  <td className="px-4 py-3 text-slate-600">€{inv.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}