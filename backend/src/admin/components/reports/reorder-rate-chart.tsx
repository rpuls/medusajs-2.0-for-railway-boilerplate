import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Response = {
  from: string
  to: string
  summary: {
    total_orders: number
    distinct_customers: number
    repeat_customers: number
    repeat_customer_rate: number
    avg_orders_per_customer: number
    total_line_items: number
    reorder_line_items: number
    reorder_line_share: number
  }
  top_reordered_products: Array<{ title: string; count: number }>
}

const KpiTile = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-y-0.5 px-3 py-2 rounded-md bg-ui-bg-subtle/50">
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text className="text-2xl font-semibold tabular-nums">{value}</Text>
  </div>
)

export const ReorderRateChart = ({
  fromIso,
  toIso,
}: {
  fromIso: string
  toIso: string
}) => {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    fetch(`/admin/reports/reorder-rate?${params.toString()}`, {
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
  }, [fromIso, toIso])

  const summary = data?.summary
  const top = data?.top_reordered_products ?? []
  const maxCount = top[0]?.count ?? 1

  const repeatPct = summary
    ? (summary.repeat_customer_rate * 100).toFixed(1)
    : "0.0"
  const reorderSharePct = summary
    ? (summary.reorder_line_share * 100).toFixed(1)
    : "0.0"

  return (
    <ReportCard
      title="Reorder rate & repeat customers"
      caption="Repeat-customer rate validates the loyalty signal. Reorder-line share measures the Phase 3 'Re-order from history' feature — high values mean customers find it useful."
      loading={loading}
      error={error}
      csv={
        !data
          ? undefined
          : {
              filenameBase: "reorder-rate",
              build: () => {
                const summaryRows: any[] = [
                  ["Metric", "Value"],
                  ["Total orders", data.summary.total_orders],
                  ["Distinct customers", data.summary.distinct_customers],
                  ["Repeat customers", data.summary.repeat_customers],
                  ["Repeat customer rate %", (data.summary.repeat_customer_rate * 100).toFixed(1)],
                  ["Avg orders per customer", data.summary.avg_orders_per_customer],
                  ["Total line items", data.summary.total_line_items],
                  ["Reorder line items", data.summary.reorder_line_items],
                  ["Reorder line share %", (data.summary.reorder_line_share * 100).toFixed(1)],
                  [],
                  ["Top reordered products", "Count"],
                  ...data.top_reordered_products.map((p) => [p.title, p.count]),
                ]
                return summaryRows.map((r) => r.join(",")).join("\n")
              },
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile label="Repeat customer rate" value={`${repeatPct}%`} />
        <KpiTile
          label="Avg orders / customer"
          value={(summary?.avg_orders_per_customer ?? 0).toFixed(2)}
        />
        <KpiTile label="Reorder line share" value={`${reorderSharePct}%`} />
        <KpiTile
          label="Distinct customers"
          value={String(summary?.distinct_customers ?? 0)}
        />
      </div>

      <div className="flex flex-col gap-y-2 mt-3">
        <Text size="small" className="text-ui-fg-subtle font-medium">
          Top reordered products
        </Text>
        {top.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            No reorders in period.
          </Text>
        ) : (
          <div className="flex flex-col gap-y-1">
            {top.map((p) => {
              const widthPct = Math.max(
                4,
                Math.round((p.count / maxCount) * 100)
              )
              return (
                <div key={p.title} className="flex items-center gap-x-3">
                  <div className="flex-1 min-w-0">
                    <Text size="small" className="truncate">
                      {p.title}
                    </Text>
                    <div className="h-2 mt-1 rounded bg-ui-bg-subtle overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${widthPct}%`,
                          background: PALETTE.teal700,
                        }}
                      />
                    </div>
                  </div>
                  <Text size="small" className="tabular-nums w-10 text-right">
                    {p.count}
                  </Text>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ReportCard>
  )
}
