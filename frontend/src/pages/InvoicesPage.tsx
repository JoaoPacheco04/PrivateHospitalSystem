import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getInvoicesByPatient, createInvoice, markInvoiceAsPaid } from '../api/invoices'
import { getPatients, getMyProfile } from '../api/patients'
import { getProcedurePrices } from '../api/procedurePrices'
import { useAuthStore } from '../store/authStore'
import { canCreate } from '../lib/permissions'
import { exportToCsv } from '../lib/exportCsv'
import { toast } from '../store/toastStore'
import InvoiceReceiptModal from '../components/InvoiceReceiptModal'
import type { Invoice } from '../types/invoice'

const statusBadges: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-600', border: 'border-amber-200' },
  Paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-600', border: 'border-emerald-200' },
  Cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-600', border: 'border-rose-200' },
}

export default function InvoicesPage() {
  const role = useAuthStore((s) => s.role)
  const patientId = useAuthStore((s) => s.patientId)
  const isPatient = role === 'Patient'
  const isAuthorizedToCreate = canCreate(role, 'invoices')

  const [selectedPatientId, setSelectedPatientId] = useState(isPatient ? patientId ?? '' : '')
  const [procedureType, setProcedureType] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedInvoiceToPrint, setSelectedInvoiceToPrint] = useState<Invoice | null>(null)
  const queryClient = useQueryClient()

  // Patients list — only for Staff/Admin
  const { data: patientsResult } = useQuery({
    queryKey: ['patients', 'all'],
    queryFn: () => getPatients(1, 100),
    enabled: !isPatient,
  })

  // For Patient role: get own profile
  const { data: myProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: getMyProfile,
    enabled: isPatient,
  })

  const { data: procedurePrices } = useQuery({
    queryKey: ['procedurePrices'],
    queryFn: getProcedurePrices,
    enabled: isAuthorizedToCreate,
  })

  const activePatientId = isPatient ? patientId ?? '' : selectedPatientId
  const activePatientName = isPatient
    ? myProfile?.fullName
    : patientsResult?.items.find((p) => p.id === activePatientId)?.fullName

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', activePatientId],
    queryFn: () => getInvoicesByPatient(activePatientId),
    enabled: !!activePatientId,
  })

  async function handleCreateInvoice() {
    if (!activePatientId || !procedureType) return
    setError(null)
    setIsSubmitting(true)
    try {
      await createInvoice({ patientId: activePatientId, procedureType })
      queryClient.invalidateQueries({ queryKey: ['invoices', activePatientId] })
      setProcedureType('')
      toast.success('Invoice issued successfully!')
    } catch {
      setError('Failed to create invoice. Ensure a price is defined for this procedure.')
      toast.error('Failed to issue invoice.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleMarkPaid(id: string) {
    await markInvoiceAsPaid(id)
    queryClient.invalidateQueries({ queryKey: ['invoices', activePatientId] })
    toast.success('Invoice marked as Paid!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isPatient ? 'My Billing & Invoices' : 'Invoices & Billing'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isPatient
              ? 'Review your medical receipts, copays and payment history.'
              : 'Generate medical billing receipts, process insurance co-pays and register payments.'}
          </p>
        </div>

        {invoices && invoices.length > 0 && (
          <button
            onClick={() => {
              exportToCsv('hospital_invoices', invoices, {
                procedureType: 'Procedure',
                totalAmount: 'Total Amount',
                insuranceCoveredAmount: 'Insurance Covered',
                patientAmount: 'Patient Due/Paid',
                issuedAt: 'Issued Date',
                status: 'Status',
              })
              toast.success('Invoices exported to CSV!')
            }}
            className="btn-secondary self-start sm:self-auto"
          >
            📥 Export Invoices CSV
          </button>
        )}
      </div>

      {/* Patient Selector Card for Staff / Admin */}
      {!isPatient && (
        <div className="app-card p-6">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Patient to View or Issue Invoices
          </label>
          <div className="max-w-md">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="app-select"
            >
              <option value="">Choose a patient...</option>
              {patientsResult?.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientNumber})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Patient info chip for Patient Role */}
      {isPatient && myProfile && (
        <div className="app-card p-4 flex items-center gap-4 bg-teal-50/40 border-teal-200/60">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-base shrink-0">
            {myProfile.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{myProfile.fullName}</p>
            <p className="text-xs text-slate-500 font-mono">Patient #{myProfile.patientNumber}</p>
          </div>
        </div>
      )}

      {activePatientId && (
        <>
          {/* New Invoice Form (Authorized Staff/Admin) */}
          {isAuthorizedToCreate && (
            <div className="app-card p-6">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                  €
                </div>
                <h2 className="text-base font-bold text-slate-800">Generate Invoice for Patient</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 max-w-2xl">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Procedure & Price Item
                  </label>
                  <select
                    value={procedureType}
                    onChange={(e) => setProcedureType(e.target.value)}
                    className="app-select"
                  >
                    <option value="">Select procedure...</option>
                    {procedurePrices?.map((p) => (
                      <option key={p.id} value={p.procedureType}>
                        {p.procedureType} — €{p.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleCreateInvoice}
                  disabled={isSubmitting || !procedureType}
                  className="btn-primary shrink-0"
                >
                  {isSubmitting ? 'Generating...' : 'Issue Invoice'}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Invoices List Card */}
          <div className="app-card overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Invoice Records</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                {invoices?.length ?? 0} invoices
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-400">Loading invoice records...</div>
            ) : !invoices || invoices.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No invoices on record for this patient.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">Procedure</th>
                      <th className="table-header">Total Amount</th>
                      <th className="table-header">Insurance Coverage</th>
                      <th className="table-header">Patient Copay</th>
                      <th className="table-header">Issue Date</th>
                      <th className="table-header">Payment Status</th>
                      <th className="table-header text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => {
                      const badge = statusBadges[inv.status] || {
                        bg: 'bg-slate-50',
                        text: 'text-slate-700',
                        dot: 'bg-slate-500',
                        border: 'border-slate-200',
                      }
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="table-cell font-bold text-slate-900">{inv.procedureType}</td>
                          <td className="table-cell font-semibold text-slate-700">€{inv.totalAmount.toFixed(2)}</td>
                          <td className="table-cell text-slate-600">
                            {inv.insuranceCoveredAmount > 0 ? (
                              <span className="text-emerald-700 font-semibold">
                                -€{inv.insuranceCoveredAmount.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-400">€0.00</span>
                            )}
                          </td>
                          <td className="table-cell">
                            <span className="font-extrabold text-slate-900 text-base">
                              €{inv.patientAmount.toFixed(2)}
                            </span>
                          </td>
                          <td className="table-cell text-slate-500 text-xs font-mono">
                            {new Date(inv.issuedAt).toLocaleDateString('en-GB')}
                          </td>
                          <td className="table-cell">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {inv.status}
                            </span>
                          </td>
                          <td className="table-cell text-right">
                            <div className="inline-flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedInvoiceToPrint(inv)}
                                className="h-8 px-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all"
                                title="Print Receipt"
                              >
                                🖨️ Receipt
                              </button>
                              {isAuthorizedToCreate && inv.status === 'Pending' && (
                                <button
                                  onClick={() => handleMarkPaid(inv.id)}
                                  className="h-8 px-3 inline-flex items-center justify-center text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg transition-all"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Printable Receipt Modal */}
      <InvoiceReceiptModal
        invoice={selectedInvoiceToPrint}
        patientName={activePatientName}
        isOpen={!!selectedInvoiceToPrint}
        onClose={() => setSelectedInvoiceToPrint(null)}
      />
    </div>
  )
}