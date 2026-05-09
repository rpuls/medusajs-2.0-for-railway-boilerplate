/**
 * Lightweight CSV builder + browser-side download helper for report
 * cards. No third-party dep — keeping the admin bundle slim.
 *
 * Usage:
 *   const csv = buildCsv(["Method", "Revenue"], rows.map(r => [r.method, r.revenue]))
 *   downloadCsv("decoration-mix.csv", csv)
 */

export type CsvCell = string | number | boolean | null | undefined

const escape = (cell: CsvCell): string => {
  if (cell === null || cell === undefined) return ""
  const s = String(cell)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export const buildCsv = (headers: string[], rows: CsvCell[][]): string => {
  const out: string[] = [headers.map(escape).join(",")]
  for (const row of rows) {
    out.push(row.map(escape).join(","))
  }
  return out.join("\n")
}

export const downloadCsv = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Defer revoke so browsers that fetch the blob asynchronously still resolve.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Date-stamped filename helper so multiple downloads don't collide. */
export const timestampedFilename = (base: string): string => {
  const stamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  return `${base}-${stamp}.csv`
}
