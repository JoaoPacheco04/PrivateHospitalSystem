import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getProcedurePrices,
  createProcedurePrice,
  updateProcedurePrice,
} from '../api/procedurePrices'
import { toast } from '../store/toastStore'

export default function ProcedurePricesPage() {
  const [procedureType, setProcedureType] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const queryClient = useQueryClient()

  const { data: prices, isLoading } = useQuery({
    queryKey: ['procedurePrices'],
    queryFn: getProcedurePrices,
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!procedureType.trim() || price === '' || Number(price) <= 0) {
      toast.error('Please enter a valid procedure name and price.')
      return
    }
    setIsSubmitting(true)
    try {
      await createProcedurePrice({
        procedureType: procedureType.trim(),
        price: Number(price),
      })
      queryClient.invalidateQueries({ queryKey: ['procedurePrices'] })
      setProcedureType('')
      setPrice('')
      toast.success('Procedure price catalog item added successfully!')
    } catch {
      toast.error('Failed to create procedure price.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSaveEdit(id: string, procType: string) {
    if (editPrice <= 0) return
    try {
      await updateProcedurePrice(id, { procedureType: procType, price: editPrice })
      queryClient.invalidateQueries({ queryKey: ['procedurePrices'] })
      setEditingId(null)
      toast.success('Price updated successfully!')
    } catch {
      toast.error('Failed to update price.')
    }
  }

  const filteredPrices = prices?.filter((p) =>
    p.procedureType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Procedure Price Catalog</h1>
        <p className="text-slate-500 text-sm mt-1">Manage standard hospital tariffs, consultation fees and surgical procedure pricing.</p>
      </div>

      {/* Add New Procedure Price Form */}
      <div className="app-card p-6 sm:p-7">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
            €
          </div>
          <h2 className="text-base font-bold text-slate-800">Add Procedure to Tariff Catalog</h2>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Procedure / Consultation Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Cardiology General Consultation, Hip Replacement"
                value={procedureType}
                onChange={(e) => setProcedureType(e.target.value)}
                className="app-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Standard Price (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 75.00"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="app-input font-bold"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting || !procedureType.trim() || price === ''} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Add Tariff Price'}
            </button>
          </div>
        </form>
      </div>

      {/* Prices List Table */}
      <div className="app-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search procedure name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 px-3 py-1.5 bg-white rounded-lg border border-slate-200 self-start sm:self-auto">
            Tariffs Defined: <strong className="text-slate-800">{prices?.length ?? 0}</strong>
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading procedure prices...</div>
        ) : !filteredPrices || filteredPrices.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No procedure tariffs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">Procedure Description</th>
                  <th className="table-header">Tariff Price (€)</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrices.map((p) => {
                  const isEditingThis = editingId === p.id
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="table-cell font-bold text-slate-900">{p.procedureType}</td>
                      <td className="table-cell">
                        {isEditingThis ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-28 h-9 px-2 text-sm border border-teal-500 rounded-lg focus:outline-none font-bold"
                          />
                        ) : (
                          <span className="font-extrabold text-slate-900 text-base">
                            €{p.price.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="table-cell text-right">
                        {isEditingThis ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(p.id, p.procedureType)}
                              className="h-8 px-3 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="h-8 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(p.id)
                              setEditPrice(p.price)
                            }}
                            className="h-8 px-3 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-600 hover:text-white border border-teal-200 rounded-lg transition-all"
                          >
                            Edit Price
                          </button>
                        )}
                      </td>
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
