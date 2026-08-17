import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '../api/auditLogs'

const actionBadges: Record<string, { bg: string; text: string; border: string }> = {
  Create: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  Update: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  Delete: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  Login: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  Cancel: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
}

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [count, setCount] = useState(50)

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['auditLogs', count],
    queryFn: () => getAuditLogs(count),
    refetchInterval: 30000,
  })

  const filteredLogs = logs?.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.performedByName && l.performedByName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.details && l.details.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Security & Audit Logs</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">Immutable system audit trail for compliance, patient record privacy and access logs.</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Records limit:</label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="app-select h-9 w-24 text-xs font-bold"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
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
              placeholder="Search audit trail by user, entity, action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 px-3 py-1.5 bg-white rounded-lg border border-slate-200 self-start sm:self-auto">
            Audit Events: <strong className="text-slate-800">{filteredLogs?.length ?? 0}</strong>
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Loading audit trail...</div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50/50">Failed to load audit logs.</div>
        ) : !filteredLogs || filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No audit events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">Timestamp</th>
                  <th className="table-header">Action</th>
                  <th className="table-header">Resource Entity</th>
                  <th className="table-header">Operator / User</th>
                  <th className="table-header">Action Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const badge = actionBadges[log.action] || {
                    bg: 'bg-slate-50',
                    text: 'text-slate-700',
                    border: 'border-slate-200',
                  }
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="table-cell font-mono text-xs text-slate-600">
                        {new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
                        <strong>{new Date(log.timestamp).toLocaleTimeString()}</strong>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="table-cell font-semibold text-slate-800">
                        {log.entityName}
                        {log.entityId && (
                          <span className="block font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                            {log.entityId}
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className="font-semibold text-slate-900 text-xs">
                          {log.performedByName || 'System / Automatic'}
                        </span>
                      </td>
                      <td className="table-cell text-xs text-slate-600 max-w-md">
                        {log.details ? (
                          <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg font-mono text-[11px] break-all">
                            {log.details}
                          </div>
                        ) : (
                          '—'
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
