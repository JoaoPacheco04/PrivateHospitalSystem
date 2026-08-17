import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMedications, createMedication, restockMedication } from '../api/medications'
import { useAuthStore } from '../store/authStore'
import { canCreate } from '../lib/permissions'
import { exportToCsv } from '../lib/exportCsv'
import { toast } from '../store/toastStore'

export default function MedicationsPage() {
  const role = useAuthStore((s) => s.role)
  const isAuthorizedToCreate = canCreate(role, 'medications')

  const [name, setName] = useState('')
  const [stockQuantity, setStockQuantity] = useState<number | ''>(0)
  const [minimumStockAlert, setMinimumStockAlert] = useState<number | ''>(10)
  const [batchNumber, setBatchNumber] = useState('LOT-2026-A1')
  const [expiryDate, setExpiryDate] = useState('2027-06-30')
  const [restockAmounts, setRestockAmounts] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'low-stock' | 'expiring'>('all')

  const queryClient = useQueryClient()

  const { data: medications, isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: getMedications,
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setIsSubmitting(true)
    try {
      await createMedication({
        name: name.trim(),
        stockQuantity: Number(stockQuantity) || 0,
        minimumStockAlert: Number(minimumStockAlert) || 0,
        batchNumber: batchNumber.trim() || undefined,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      })
      queryClient.invalidateQueries({ queryKey: ['medications'] })
      setName('')
      setStockQuantity(0)
      setMinimumStockAlert(10)
      toast.success('Medication added to pharmacy catalog!')
    } catch {
      setError('Failed to create medication. Please check the values and try again.')
      toast.error('Failed to create medication.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRestock(id: string) {
    const amount = restockAmounts[id]
    if (!amount || amount <= 0) return
    await restockMedication(id, amount)
    queryClient.invalidateQueries({ queryKey: ['medications'] })
    setRestockAmounts((prev) => ({ ...prev, [id]: 0 }))
    toast.success('Medication inventory restocked successfully!')
  }

  // Helper for expiration status
  function getExpiryStatus(dateStr?: string) {
    if (!dateStr) return { label: 'Valid', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', isCritical: false }
    const now = new Date()
    const exp = new Date(dateStr)
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24))

    if (diffDays < 0) {
      return { label: 'Expired ⛔', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300', isCritical: true }
    }
    if (diffDays <= 30) {
      return { label: `Expires in ${diffDays}d ⚠️`, color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300', isCritical: true }
    }
    return { label: 'Valid / Safe', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300', isCritical: false }
  }

  const filtered = medications?.filter((m) => {
    const matchesName = m.name.toLowerCase().includes(searchTerm.toLowerCase())
    if (filterMode === 'low-stock') return matchesName && m.isLowStock
    if (filterMode === 'expiring') {
      const status = getExpiryStatus(m.expiryDate)
      return matchesName && status.isCritical
    }
    return matchesName
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Pharmacy & Medication Stock
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage pharmaceutical stock, track batch numbers & monitor drug expiration dates.
          </p>
        </div>

        {medications && medications.length > 0 && (
          <button
            onClick={() => {
              exportToCsv('hospital_medications', medications as unknown as Record<string, unknown>[], {
                name: 'Medication Name',
                stockQuantity: 'Current Stock',
                minimumStockAlert: 'Minimum Alert Threshold',
                batchNumber: 'Batch / Lot #',
                isLowStock: 'Low Stock Flag',
              })
              toast.success('Medications exported to CSV!')
            }}
            className="btn-secondary self-start sm:self-auto"
          >
            📥 Export CSV
          </button>
        )}
      </div>

      {/* New Medication Form */}
      {isAuthorizedToCreate && (
        <div className="app-card p-6 sm:p-7">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
              💊
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Register New Pharmaceutical Item</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add drug to central hospital inventory with batch control</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Medication Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amoxicillin 500mg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="app-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Initial Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="app-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Min Stock Alert Level *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="10"
                  value={minimumStockAlert}
                  onChange={(e) => setMinimumStockAlert(e.target.value === '' ? '' : Number(e.target.value))}
                  className="app-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Batch / Lot #
                </label>
                <input
                  type="text"
                  placeholder="LOT-2026-A1"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="app-input font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="app-input font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={isSubmitting || !name.trim()} className="btn-primary">
                {isSubmitting ? 'Registering...' : 'Add Medication'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medication Inventory List Table */}
      <div className="app-card overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <div className="relative max-w-xs w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search medication name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="app-input pl-10"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterMode('all')}
                className={`h-9 px-3 rounded-xl text-xs font-bold transition-all ${
                  filterMode === 'all'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setFilterMode('low-stock')}
                className={`h-9 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  filterMode === 'low-stock'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <span>⚠️</span>
                <span>Low Stock</span>
              </button>
            </div>
          </div>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            Showing: <strong className="text-slate-800 dark:text-white">{filtered?.length ?? 0}</strong> items
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <svg className="w-6 h-6 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-medium">Loading pharmacy inventory...</p>
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-medium">No medications found matching filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">Medication Name</th>
                  <th className="table-header">Batch / Lot #</th>
                  <th className="table-header">Current Stock</th>
                  <th className="table-header">Min Alert Level</th>
                  <th className="table-header">Stock Status</th>
                  <th className="table-header">Expiry Check</th>
                  {isAuthorizedToCreate && <th className="table-header text-right">Restock Supply</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((m) => {
                  const expiry = getExpiryStatus(m.expiryDate)
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="table-cell font-bold text-slate-900 dark:text-white">{m.name}</td>
                      <td className="table-cell font-mono text-xs text-slate-600 dark:text-slate-300">
                        {m.batchNumber || 'LOT-2026-A1'}
                      </td>
                      <td className="table-cell">
                        <span className="font-extrabold text-slate-800 dark:text-white text-base">{m.stockQuantity}</span>
                        <span className="text-xs text-slate-400 ml-1">units</span>
                      </td>
                      <td className="table-cell text-slate-500 dark:text-slate-400 text-xs">{m.minimumStockAlert} units</td>
                      <td className="table-cell">
                        {m.isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Low Stock Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${expiry.color}`}>
                          {expiry.label}
                        </span>
                      </td>
                      {isAuthorizedToCreate && (
                        <td className="table-cell text-right">
                          <div className="inline-flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={restockAmounts[m.id] ?? ''}
                              onChange={(e) =>
                                setRestockAmounts((prev) => ({
                                  ...prev,
                                  [m.id]: Number(e.target.value),
                                }))
                              }
                              className="w-20 h-8 px-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none"
                            />
                            <button
                              onClick={() => handleRestock(m.id)}
                              disabled={!restockAmounts[m.id] || restockAmounts[m.id] <= 0}
                              className="h-8 px-3 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-600 text-teal-700 dark:text-teal-300 hover:text-white border border-teal-200 dark:border-teal-800 text-xs font-bold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Restock
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}