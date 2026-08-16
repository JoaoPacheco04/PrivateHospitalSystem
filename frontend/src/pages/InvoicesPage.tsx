import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getInvoicesByPatient, createInvoice, markInvoiceAsPaid } from '../api/invoices'
import { getPatients } from '../api/patients'
import { getProcedurePrices } from '../api/procedurePrices'

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
}

export default function InvoicesPage() {
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [procedureType, setProcedureType] = useState('')
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: patientsResult } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => getPatients(1, 100),
  })

  const { data: procedurePrices } = useQuery({
    queryKey: ['procedurePrices'],
    queryFn: getProcedurePrices,
  })

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', selectedPatientId],
    queryFn: () => getInvoicesByPatient(selectedPatientId),
    enabled: !!selectedPatientId,
  })

  async function handleCreateInvoice() {
    if (!selectedPatientId || !procedureType) return
    setError(null)
    try {
      await createInvoice({ patientId: selectedPatientId, procedureType })
      queryClient.invalidateQueries({ queryKey: ['invoices', selectedPatientId] })
      setProcedureType('')
    } catch {
      setError('Failed to create invoice. Check if a price is configured for this procedure.')
    }
  }

  async function handleMarkPaid(id: string) {
    await markInvoiceAsPaid(id)
    queryClient.invalidateQueries({ queryKey: ['invoices', selectedPatientId] })
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-teal-500 rounded-full" />
        <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-medium text-slate-600 mb-1">Select Patient</label>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="w-full max-w-md border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Select a patient...</option>
          {patientsResult?.items.map((p) => (
            <option key={p.id} value={p.id}>
              {p.fullName}
            </option>
          ))}
        </select>
      </div>

      {selectedPatientId && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">New Invoice</h2>
            <div className="flex gap-2">
              <select
                value={procedureType}
                onChange={(e) => setProcedureType(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select a procedure...</option>
                {procedurePrices?.map((p) => (
                  <option key={p.id} value={p.procedureType}>
                    {p.procedureType} — €{p.price.toFixed(2)}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateInvoice}
                disabled={!procedureType}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
              >
                Create Invoice
              </button>
            </div>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          </div>

          {isLoading ? (
            <p className="text-slate-500">Loading invoices...</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-teal-50/60 border-b border-teal-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Procedure</th>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Total</th>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Insurance</th>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Patient Pays</th>
                    <th className="text-left px-4 py-3 font-medium text-teal-800">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-teal-800"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices?.map((inv) => (
                    <tr key={inv.id} className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800">{inv.procedureType}</td>
                      <td className="px-4 py-3 text-slate-600">€{inv.totalAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-600">€{inv.insuranceCoveredAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">€{inv.patientAmount.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            statusColors[inv.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {inv.status === 'Pending' && (
                          <button
                            onClick={() => handleMarkPaid(inv.id)}
                            className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                          >
                            Mark as Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {invoices?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                        No invoices for this patient yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}