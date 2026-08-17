export function RevenueTrendBarChart({
  revenue,
  pending,
}: {
  revenue: number
  pending: number
}) {
  // Generate sample 7-day data ending at current values
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const total = revenue + pending || 1
  const points = [
    Math.round(total * 0.1),
    Math.round(total * 0.14),
    Math.round(total * 0.08),
    Math.round(total * 0.18),
    Math.round(total * 0.22),
    Math.round(total * 0.16),
    Math.round(revenue || total * 0.12),
  ]
  const max = Math.max(...points, 100)

  return (
    <div className="app-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">7-Day Revenue & Billing Trend</h3>
          <p className="text-xs text-slate-400">Daily gross clinical billings & collections</p>
        </div>
        <span className="font-mono text-xs font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full">
          Total: €{(revenue + pending).toFixed(2)}
        </span>
      </div>

      <div className="pt-4 flex items-end justify-between gap-2 h-44 border-b border-slate-100 dark:border-slate-800 pb-2">
        {points.map((val, idx) => {
          const heightPercent = Math.max(12, Math.round((val / max) * 100))
          const isToday = idx === points.length - 1
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
              {/* Tooltip */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded pointer-events-none z-20 shadow-md">
                €{val.toFixed(2)}
              </div>

              {/* Bar */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[32px] rounded-t-xl transition-all duration-500 group-hover:scale-105 ${
                  isToday
                    ? 'bg-gradient-to-t from-teal-700 to-teal-500 shadow-md shadow-teal-500/20'
                    : 'bg-gradient-to-t from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600'
                }`}
              />

              {/* Day Label */}
              <span className={`text-[11px] font-bold ${isToday ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
                {days[idx]}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          <span>Settled: €{revenue.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Pending: €{pending.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export function TriageDistributionDonut({
  red = 0,
  orange = 0,
  total = 0,
}: {
  red: number
  orange: number
  total: number
}) {
  const yellow = Math.max(0, total - red - orange)
  const safeTotal = total || 1

  const redPct = Math.round((red / safeTotal) * 100)
  const orangePct = Math.round((orange / safeTotal) * 100)
  const yellowPct = Math.max(0, 100 - redPct - orangePct)

  return (
    <div className="app-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Manchester Triage Acuity</h3>
          <p className="text-xs text-slate-400">Emergency queue priority classification</p>
        </div>
        <span className="text-xs font-bold text-slate-500">{total} active</span>
      </div>

      <div className="flex items-center gap-6 py-2">
        {/* Visual Donut Ring using SVG */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
            {/* Background ring */}
            <path
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Red segment */}
            <path
              className="text-rose-500"
              strokeDasharray={`${redPct}, 100`}
              strokeWidth="4.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">{total}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold">in ER</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">P1: Immediate (Red)</span>
            </div>
            <span className="font-bold font-mono text-rose-600">{red}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">P2: Very Urgent</span>
            </div>
            <span className="font-bold font-mono text-orange-600">{orange}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">P3: Urgent / Standard</span>
            </div>
            <span className="font-bold font-mono text-amber-600">{yellow}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
