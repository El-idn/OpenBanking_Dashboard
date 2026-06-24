import { saveAs } from '@/lib/csv'

export function exportToCsv<T extends object>(
  data: T[],
  filename: string,
  columns: { key: keyof T; header: string }[],
) {
  if (data.length === 0) return

  const headers = columns.map((c) => c.header)
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key]
      const str = val == null ? '' : String(val)
      return str.includes(',') ? `"${str}"` : str
    }),
  )

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  saveAs(csv, filename)
}
