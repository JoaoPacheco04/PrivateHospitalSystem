import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getRooms, createRoom } from '../api/rooms'
import { getBeds, createBed } from '../api/beds'
import { useAuthStore } from '../store/authStore'
import { canCreate } from '../lib/permissions'
import { exportToCsv } from '../lib/exportCsv'
import { toast } from '../store/toastStore'
import type { Bed } from '../types/bed'

const bedStatusStyles: Record<string, { bg: string; text: string; dot: string; border: string; label: string }> = {
  Available: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800', label: 'Available' },
  Occupied: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500', border: 'border-rose-200 dark:border-rose-800', label: 'Occupied' },
  Maintenance: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-800', label: 'Sanitizing / Maint.' },
}

export default function RoomsBedsPage() {
  const [tab, setTab] = useState<'floorplan' | 'beds' | 'rooms'>('floorplan')
  const role = useAuthStore((s) => s.role)
  const isAuthorized = canCreate(role, 'rooms')
  const queryClient = useQueryClient()

  const { data: rooms, isLoading: loadingRooms } = useQuery({ queryKey: ['rooms'], queryFn: getRooms })
  const { data: beds, isLoading: loadingBeds } = useQuery({ queryKey: ['beds'], queryFn: getBeds })

  const [roomNumber, setRoomNumber] = useState('')
  const [roomDepartment, setRoomDepartment] = useState('')
  const [bedNumber, setBedNumber] = useState('')
  const [bedDepartment, setBedDepartment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Floorplan department filter
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL')

  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault()
    if (!roomNumber.trim()) return
    setError(null)
    setIsSubmitting(true)
    try {
      await createRoom({ roomNumber: roomNumber.trim(), department: roomDepartment.trim() || undefined })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
      setRoomNumber('')
      setRoomDepartment('')
      toast.success('Room registered successfully!')
    } catch {
      setError('Failed to create room. Room number may already exist.')
      toast.error('Failed to create room.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCreateBed(e: React.FormEvent) {
    e.preventDefault()
    if (!bedNumber.trim() || !bedDepartment.trim()) return
    setError(null)
    setIsSubmitting(true)
    try {
      await createBed({ bedNumber: bedNumber.trim(), department: bedDepartment.trim() })
      queryClient.invalidateQueries({ queryKey: ['beds'] })
      setBedNumber('')
      setBedDepartment('')
      toast.success('Bed unit registered successfully!')
    } catch {
      setError('Failed to create bed.')
      toast.error('Failed to create bed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate statistics
  const totalBeds = beds?.length ?? 0
  const availableBeds = beds?.filter((b) => b.status === 'Available').length ?? 0
  const occupiedBeds = beds?.filter((b) => b.status === 'Occupied').length ?? 0
  const maintenanceBeds = beds?.filter((b) => b.status === 'Maintenance').length ?? 0
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

  // Group beds by department for Floorplan
  const bedsByDept = (beds ?? []).reduce<Record<string, Bed[]>>((acc, item) => {
    const dept = item.department || 'General Ward'
    acc[dept] = acc[dept] ? [...acc[dept], item] : [item]
    return acc
  }, {})

  const departmentNames = Object.keys(bedsByDept).sort()
  const visibleDepts = selectedDeptFilter === 'ALL' ? departmentNames : departmentNames.filter((d) => d === selectedDeptFilter)

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Rooms, Beds & Ward Map
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Visual ward floorplan, bed occupancy monitoring and clinical room configuration.
          </p>
        </div>

        {beds && beds.length > 0 && (
          <button
            onClick={() => {
              exportToCsv('hospital_beds_status', beds, {
                bedNumber: 'Bed Number',
                department: 'Ward / Department',
                status: 'Occupancy Status',
              })
              toast.success('Beds inventory exported to CSV!')
            }}
            className="btn-secondary self-start sm:self-auto"
          >
            📥 Export CSV
          </button>
        )}
      </div>

      {/* Ward Occupancy KPI Pill Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="app-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
            🛏️
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Capacity</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{totalBeds} Beds</p>
          </div>
        </div>

        <div className="app-card p-4 flex items-center gap-3 border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/20">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            🟢
          </div>
          <div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Available</p>
            <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300">{availableBeds} Ready</p>
          </div>
        </div>

        <div className="app-card p-4 flex items-center gap-3 border-rose-200/60 dark:border-rose-900/40 bg-rose-50/20">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
            🔴
          </div>
          <div>
            <p className="text-xs text-rose-700 dark:text-rose-400 font-semibold">Occupied</p>
            <p className="text-xl font-extrabold text-rose-800 dark:text-rose-300">{occupiedBeds} Inpatients</p>
          </div>
        </div>

        <div className="app-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
            📊
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Occupancy Rate</p>
            <p className="text-xl font-extrabold text-teal-700 dark:text-teal-400">{occupancyRate}%</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setTab('floorplan')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            tab === 'floorplan'
              ? 'bg-teal-600 text-white shadow-md'
              : 'app-card text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          🗺️ Ward Floorplan Map
        </button>
        <button
          onClick={() => setTab('beds')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            tab === 'beds'
              ? 'bg-teal-600 text-white shadow-md'
              : 'app-card text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          🛏️ Beds List ({beds?.length ?? 0})
        </button>
        <button
          onClick={() => setTab('rooms')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            tab === 'rooms'
              ? 'bg-teal-600 text-white shadow-md'
              : 'app-card text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          🚪 Consultation Rooms ({rooms?.length ?? 0})
        </button>
      </div>

      {/* TAB: FLOORPLAN MAP */}
      {tab === 'floorplan' && (
        <div className="space-y-6">
          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl max-w-fit">
            <button
              onClick={() => setSelectedDeptFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDeptFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              All Wards ({totalBeds})
            </button>
            {departmentNames.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDeptFilter(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDeptFilter === d
                    ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {d} ({bedsByDept[d].length})
              </button>
            ))}
          </div>

          {loadingBeds ? (
            <div className="p-12 text-center text-slate-400">Loading ward floorplan...</div>
          ) : visibleDepts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No beds configured yet.</div>
          ) : (
            <div className="space-y-6">
              {visibleDepts.map((dept) => {
                const wardBeds = bedsByDept[dept]
                return (
                  <div key={dept} className="app-card p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🏥</span>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{dept}</h3>
                      </div>
                      <span className="text-xs font-bold text-slate-500 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        {wardBeds.length} bed units
                      </span>
                    </div>

                    {/* Bed Grid Graphic */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {wardBeds.map((bed) => {
                        const style = bedStatusStyles[bed.status] || bedStatusStyles.Available
                        return (
                          <div
                            key={bed.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${style.bg} ${style.border} hover:shadow-md`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                                #{bed.bedNumber}
                              </span>
                              <span className={`w-2.5 h-2.5 rounded-full ${style.dot} ${bed.status === 'Available' ? 'animate-pulse' : ''}`} />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Status
                              </span>
                              <span className={`text-xs font-extrabold block truncate ${style.text}`}>
                                {style.label}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: BEDS LIST */}
      {tab === 'beds' && (
        <div className="space-y-6">
          {isAuthorized && (
            <div className="app-card p-6 sm:p-7">
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                Register New Bed Unit
              </h2>
              <form onSubmit={handleCreateBed} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Bed Identifier *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. B-101, ICU-04"
                      value={bedNumber}
                      onChange={(e) => setBedNumber(e.target.value)}
                      className="app-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Department / Ward *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cardiology, Intensive Care, Ward B"
                      value={bedDepartment}
                      onChange={(e) => setBedDepartment(e.target.value)}
                      className="app-input"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isSubmitting || !bedNumber.trim() || !bedDepartment.trim()} className="btn-primary">
                    {isSubmitting ? 'Registering...' : 'Add Bed Unit'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="app-card overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">All Bed Units</h2>
            </div>
            {loadingBeds ? (
              <div className="p-12 text-center text-slate-400">Loading beds...</div>
            ) : !beds || beds.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No beds registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">Bed Number</th>
                      <th className="table-header">Department / Ward</th>
                      <th className="table-header">Occupancy Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {beds.map((b) => {
                      const style = bedStatusStyles[b.status] || bedStatusStyles.Available
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="table-cell font-mono font-bold text-slate-900 dark:text-white">#{b.bedNumber}</td>
                          <td className="table-cell font-semibold text-slate-700 dark:text-slate-300">{b.department}</td>
                          <td className="table-cell">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              {style.label}
                            </span>
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
      )}

      {/* TAB: ROOMS LIST */}
      {tab === 'rooms' && (
        <div className="space-y-6">
          {isAuthorized && (
            <div className="app-card p-6 sm:p-7">
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                Register Consultation Room
              </h2>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Room Number / Office *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 101, Consultation 3"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="app-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Department / Specialty
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. General Practice, Pediatrics"
                      value={roomDepartment}
                      onChange={(e) => setRoomDepartment(e.target.value)}
                      className="app-input"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={isSubmitting || !roomNumber.trim()} className="btn-primary">
                    {isSubmitting ? 'Registering...' : 'Add Room'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="app-card overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Active Consultation Rooms</h2>
            </div>
            {loadingRooms ? (
              <div className="p-12 text-center text-slate-400">Loading rooms...</div>
            ) : !rooms || rooms.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No rooms registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="table-header">Room Code</th>
                      <th className="table-header">Assigned Department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rooms.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="table-cell font-bold text-slate-900 dark:text-white">Room {r.roomNumber}</td>
                        <td className="table-cell text-slate-600 dark:text-slate-300">{r.department || 'Outpatient Clinic'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}