import { Text, Tooltip } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Cell = { month_offset: number; revenue: number; orders: number } | null

type Cohort = {
  cohort: string
  customer_count: number
  cells: Cell[]
}

type Response = {
  horizon_months: number
  cohorts: Cohort[]
}

const formatCurrency = (n: number) => {
  if (n === 0) return "—"
  if (n >= 1000) return `$${Math.round(n / 100) / 10}k`
  return `$${Math.round(n)}`
}

/**
 * Triangular cohort heatmap. Rows = cohorts (oldest at top), columns =
 * months since first order. Cell color intensity is revenue, scaled to
 * the largest cell so the eye can spot which cohorts kept spending.
 */
export const CohortsChart = ({ regionId }: { regionId: string | null }) => {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ months: "12" })
    if (regionId) params.set("region_id", regionId)
    fetch(`/admin/reports/cohorts?${params.toString()}`, {
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((j) => {
        if (!cancelled) setData(j as Response)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [regionId])

  const cohorts = data?.cohorts ?? []
  const maxRevenue = Math.max(
    1,
    ...cohorts.flatMap((c) => c.cells.map((cell) => cell?.revenue ?? 0))
  )

  return (
    <ReportCard
      title="Cohort retention"
      caption="Each row is a cohort of customers who placed their first order in that month. Columns show that cohort's revenue in subsequent months. Darker = more revenue. Diagonal fade-out = cohorts dying off; bright far-right cells = active long-term loyalty."
      help={{
        title: "Cohort retention",
        body: "Reading a cohort table: each row is the group of customers who placed their first order in a given month, and each column is how much that group spent in the months that followed. Darker cell = more revenue from that cohort that month.",
        bullets: [
          "Diagonal fade-out (top-left dark, bottom-right pale) = the typical 'cohorts die over time' pattern; healthy if not too steep.",
          "Bright cells far to the right = a cohort that's still active years later. Those are your most valuable customers — find what they have in common and acquire more like them.",
          "A row that suddenly goes pale before the others is a flagged month — something happened in the customer experience just after they signed up. Worth investigating.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        cohorts.length === 0
          ? undefined
          : {
              filenameBase: "cohort-retention",
              build: () => {
                const headers = [
                  "Cohort",
                  "Customers",
                  ...Array.from({ length: data?.horizon_months ?? 12 }).map(
                    (_, i) => `Month ${i} revenue`
                  ),
                ]
                const rows = cohorts.map((c) => [
                  c.cohort,
                  c.customer_count,
                  ...c.cells.map((cell) => cell?.revenue ?? 0),
                ])
                return buildCsv(headers, rows)
              },
            }
      }
    >
      {cohorts.length === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          No cohorts in the past 12 months.
        </Text>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-ui-fg-subtle">
                <th className="text-left px-2 py-1 font-medium">Cohort</th>
                <th className="text-right px-2 py-1 font-medium">Customers</th>
                {Array.from({ length: data?.horizon_months ?? 12 }).map(
                  (_, i) => (
                    <th
                      key={i}
                      className="text-center px-2 py-1 font-medium tabular-nums"
                    >
                      M{i}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c) => (
                <tr key={c.cohort} className="border-t border-ui-border-base">
                  <td className="px-2 py-1 font-mono">{c.cohort}</td>
                  <td className="px-2 py-1 text-right tabular-nums text-ui-fg-muted">
                    {c.customer_count}
                  </td>
                  {c.cells.map((cell, i) => {
                    if (!cell) {
                      return (
                        <td
                          key={i}
                          className="px-1 py-0.5 text-center text-ui-fg-muted"
                        >
                          —
                        </td>
                      )
                    }
                    const intensity = cell.revenue / maxRevenue
                    const bg =
                      intensity > 0
                        ? `rgba(20, 83, 45, ${0.15 + intensity * 0.65})` // emerald scale
                        : "transparent"
                    const fg = intensity > 0.4 ? "#ffffff" : PALETTE.slate700
                    return (
                      <td
                        key={i}
                        className="text-center tabular-nums"
                        style={{
                          background: bg,
                          color: fg,
                          padding: "4px 6px",
                          minWidth: 56,
                        }}
                      >
                        <Tooltip
                          content={`${formatCurrency(cell.revenue)} from ${cell.orders} orders`}
                        >
                          <span>{formatCurrency(cell.revenue)}</span>
                        </Tooltip>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReportCard>
  )
}
