import type { Invoice } from '../types/invoice'

export default function InvoiceReceiptModal({
  invoice,
  patientName,
  isOpen,
  onClose,
}: {
  invoice: Invoice | null
  patientName?: string
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen || !invoice) return null

  function handlePrint() {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 print:border-none print:shadow-none print:max-w-full">
        {/* Hospital Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Private Hospital</h2>
            <p className="text-xs text-slate-500">Clinical & Medical Billing Center</p>
            <p className="text-xs text-slate-400">NIF: 509 123 456 · Lisbon, Portugal</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full font-mono text-xs font-bold">
              RECEIPT
            </span>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Date: {new Date(invoice.issuedAt).toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="py-6 space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Billed To</p>
            <p className="text-sm font-bold text-slate-800">{patientName || 'Hospital Inpatient'}</p>
            <p className="text-xs text-slate-500 font-mono">Invoice ID: #{invoice.id.substring(0, 8)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm py-1 border-b border-slate-100">
              <span className="font-semibold text-slate-700">{invoice.procedureType}</span>
              <span className="font-bold text-slate-900">€{invoice.totalAmount.toFixed(2)}</span>
            </div>
            {invoice.insuranceCoveredAmount > 0 && (
              <div className="flex justify-between text-xs py-1 text-emerald-700 font-medium">
                <span>Insurance Co-Pay Coverage</span>
                <span>-€{invoice.insuranceCoveredAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t-2 border-slate-200">
              <span>Amount Paid / Due:</span>
              <span className="text-teal-700 font-mono">€{invoice.patientAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Payment Status:</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-full ${
                invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 print:hidden">
          <button type="button" onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button type="button" onClick={handlePrint} className="btn-primary">
            🖨️ Print Receipt
          </button>
        </div>
      </div>
    </div>
  )
}
