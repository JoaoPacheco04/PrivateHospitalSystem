import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getRooms, createRoom } from '../api/rooms'
import { getBeds, createBed } from '../api/beds'

const statusColors: Record<string, string> = {
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Occupied: 'bg-amber-50 text-amber-700 border-amber-200',
  Maintenance: 'bg-red-50 text-red-700 border-red-200',
}

export default function RoomsBedsPage() {
  const [tab, setTab] = useState<'rooms' | 'beds'>('rooms')
  const queryClient = useQueryClient()

  const { data: rooms } = useQuery({ queryKey: ['rooms'], queryFn: getRooms })
  const { data: beds } = useQuery({ queryKey: ['beds'], queryFn: getBeds })

  const [roomNumber, setRoomNumber] = useState('')
  const [roomDepartment, setRoomDepartment] = useState('')
  const [bedNumber, setBedNumber] = useState('')
  const [bedDepartment, setBedDepartment] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault()
    if (!roomNumber) return
    setError(null)
    try {
      await createRoom({ roomNumber, department: roomDepartment || undefined })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setRoomNumber('')
      setRoomDepartment('')
    } catch {
      setError('Failed to create room.')
    }
  }

  async function handleCreateBed(e: React.FormEvent) {
    e.preventDefault()
    if (!bedNumber || !bedDepartment) return
    setError(null)
    try {
      await createBed({ bedNumber, department: bedDepartment })
      queryClient.invalidateQueries({ queryKey: ['beds'] })
      setBedNumber('')
      setBedDepartment('')
    } catch {
      setError('Failed to create bed.')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-teal-500 rounded-full" />
        <h1 className="text-2xl font-bold text-slate-800">Rooms & Beds</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('rooms')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'rooms' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-300'
          }`}
        >
          Rooms
        </button>
        <button
          onClick={() => setTab('beds')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'beds' ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-300'
          }`}
        >
          Beds
        </button>
      </div>

      {tab === 'rooms' && (
        <>
          <form onSubmit={handleCreateRoom} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Room Number *</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Department</label>
              <input
                type="text"
                value={roomDepartment}
                onChange={(e) => setRoomDepartment(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Add Room
            </button>
          </form>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-teal-50/60 border-b border-teal-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-teal-800">Room Number</th>
                  <th className="text-left px-4 py-3 font-medium text-teal-800">Department</th>
                  <th className="text-left px-4 py-3 font-medium text-teal-800">Status</th>
                </tr>
              </thead>
              <tbody>
                {rooms?.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{r.roomNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{r.department ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          statusColors[r.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'beds' && (
        <>
          <form onSubmit={handleCreateBed} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Bed Number *</label>
              <input
                type="text"
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Department *</label>
              <input
                type="text"
                value={bedDepartment}
                onChange={(e) => setBedDepartment(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Add Bed
            </button>
          </form>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-teal-50/60 border-b border-teal-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-teal-800">Bed Number</th>
                  <th className="text-left px-4 py-3 font-medium text-teal-800">Department</th>
                  <th className="text-left px-4 py-3 font-medium text-teal-800">Status</th>
                </tr>
              </thead>
              <tbody>
                {beds?.map((b) => (
                  <tr key={b.id} className="border-b border-slate-100 hover:bg-teal-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{b.bedNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{b.department}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          statusColors[b.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
    </div>
  )
}