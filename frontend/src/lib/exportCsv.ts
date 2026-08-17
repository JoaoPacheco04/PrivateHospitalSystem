/**
 * Exports an array of objects to a downloaded CSV file
 */
export function exportToCsv<T extends object>(
  filename: string,
  rows: T[],
  headersMap?: Record<string, string>
) {
  if (!rows || rows.length === 0) return

  const keys = Object.keys(rows[0]) as Array<keyof T>
  const headerLabels = keys.map((k) => (headersMap ? headersMap[String(k)] || String(k) : String(k)))

  const csvContent = [
    headerLabels.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) =>
      keys
        .map((k) => {
          let val = (row as Record<string, unknown>)[String(k)]
          if (val === null || val === undefined) val = ''
          else if (typeof val === 'object') val = JSON.stringify(val)
          return `"${String(val).replace(/"/g, '""')}"`
        })
        .join(',')
    ),
  ].join('\r\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
