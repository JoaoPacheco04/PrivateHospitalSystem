export default function QrCodeBadge({
  value,
  size = 96,
  label,
}: {
  value: string
  size?: number
  label?: string
}) {
  // Deterministic SVG QR-like matrix pattern based on string hash
  const hash = Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rows = 13
  const cols = 13

  const grid: boolean[][] = Array(rows)
    .fill(false)
    .map((_, r) =>
      Array(cols)
        .fill(false)
        .map((_, c) => {
          // Standard QR corner finder patterns
          if ((r < 4 && c < 4) || (r < 4 && c >= cols - 4) || (r >= rows - 4 && c < 4)) {
            if (
              (r === 0 || r === 3 || c === 0 || c === 3) ||
              (r === 0 || r === 3 || c === cols - 4 || c === cols - 1) ||
              (r === rows - 4 || r === rows - 1 || c === 0 || c === 3)
            ) {
              return true
            }
            if ((r === 1 || r === 2) && (c === 1 || c === 2)) return true
            if ((r === 1 || r === 2) && (c === cols - 3 || c === cols - 2)) return true
            if ((r === rows - 3 || r === rows - 2) && (c === 1 || c === 2)) return true
            return false
          }
          // Inner data pattern derived from string value
          return ((hash + r * 7 + c * 13 + (r * c)) % 3) === 0
        })
    )

  return (
    <div className="flex flex-col items-center gap-1.5 p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-fit">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${cols} ${rows}`}
        className="text-slate-900 dark:text-white"
      >
        {grid.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="currentColor" />
            ) : null
          )
        )}
      </svg>
      {label && <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{label}</span>}
    </div>
  )
}
