export interface LabValue {
  name: string
  value: number
  unit: string
  minRef: number
  maxRef: number
}

export function LabValueGauge({ lab }: { lab: LabValue }) {
  const { name, value, unit, minRef, maxRef } = lab

  const rangeSpan = maxRef - minRef
  const totalMin = Math.max(0, minRef - rangeSpan * 0.5)
  const totalMax = maxRef + rangeSpan * 0.5
  const totalSpan = totalMax - totalMin

  const normalizedVal = Math.min(Math.max(value, totalMin), totalMax)
  const percent = Math.round(((normalizedVal - totalMin) / totalSpan) * 100)

  const isLow = value < minRef
  const isHigh = value > maxRef
  const isNormal = !isLow && !isHigh

  return (
    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-800 dark:text-white">{name}</p>
          <p className="text-[10px] text-slate-400 font-mono">
            Ref: {minRef} - {maxRef} {unit}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
            {value} <span className="text-xs text-slate-400 font-normal">{unit}</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
              isNormal
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : isHigh
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
            }`}
          >
            {isNormal ? 'Normal' : isHigh ? 'High' : 'Low'}
          </span>
        </div>
      </div>

      {/* Tri-color Range Bar */}
      <div className="relative pt-2 pb-1">
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 flex overflow-hidden">
          <div className="w-1/4 bg-sky-300 dark:bg-sky-700/60" title="Low" />
          <div className="w-1/2 bg-emerald-400 dark:bg-emerald-600/70" title="Normal Range" />
          <div className="w-1/4 bg-rose-400 dark:bg-rose-700/60" title="High" />
        </div>

        {/* Current Value Pointer */}
        <div
          style={{ left: `${Math.min(Math.max(percent, 4), 96)}%` }}
          className="absolute -top-0.5 transform -translate-x-1/2 flex flex-col items-center"
        >
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 shadow-md ${
              isNormal ? 'bg-emerald-600' : isHigh ? 'bg-rose-600' : 'bg-sky-600'
            }`}
          />
        </div>
      </div>
    </div>
  )
}
