import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMedications, createMedication, restockMedication } from '../api/medications'

export default function MedicationsPage() {
  const [name, setName] = useState('')
  const [stockQuantity, setStockQuantity] = useState(0)
  const [minimumStockAlert, setMinimumStockAlert] = useState(10)
  const [restockAmounts, setRestockAmounts] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: medications, isLoading } = useQuery({ queryKey: ['medications'], queryFn: getMedications })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return
    setError(null)
    try {
      await createMedication({ name, stockQuantity, minimumStockAlert })
      queryClient.invalidateQueries({ queryKey: ['medications'] })
      setName('')
      setStockQuantity(0)
    } catch {
      setError('Failed to create medication.')
    }
  }

  async function handleRestock(id: string) {
    const amount = restockAmounts[id]
    if (!amount) return
    await restockMedication(id, amount)
    queryClient.invalidateQueries({ queryKey: ['medications'] })
    setRestockAmounts((prev) => ({ ...prev, [id]: 0 }))
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-teal-500 rounded-full" />
        <h1 className="text-2xl font-bold text-slate-800">Medications</h1>
      </div>

      <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-600 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-slate-600 mb-1">Stock</label>
          <input
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-slate-600 mb-1">Min Alert</label>
          <input
            type="number"
            value={minimumStockAlert}
            onChange={(e) => setMinimumStockAlert(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
        >
          Add Medication
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-teal-50/60 border-b border-teal-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Name</th>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Stock</th>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Min Alert</th>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Status</th>
                <th className="text-left px-4 py-3 font-medium text-teal-800">Restock</th>
              </tr>
            </thead>
            <tbody>
              {medications?.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                  <td className="px-4 py-3 text-slate-600">{m.stockQuantity}</td>
                  <td className="px-4 py-3 text-slate-500">{m.minimumStockAlert}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        m.isLowStock
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {m.isLowStock ? 'Low Stock' : 'OK'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={restockAmounts[m.id] ?? ''}
                        onChange={(e) =>
                          setRestockAmounts((prev) => ({ ...prev, [m.id]: Number(e.target.value) }))
                        }
                        className="w-20 border border-slate-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        onClick={() => handleRestock(m.id)}
                        className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                      >
                        Restock
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}