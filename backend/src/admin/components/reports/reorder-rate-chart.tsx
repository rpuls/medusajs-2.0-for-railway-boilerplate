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
    prior_total_orders?: number
    prior_distinct_customers?: number
    prior_repeat_customer_rate?: number
    prior_avg_orders_per_customer?: number
    prior_reorder_line_share?: number
    repeat_rate_delta_pp?: number | null
    reorder_share_delta_pp?: number | null
    orders_delta_pct?: number | null
  }
  top_reordered_products: Array<{ title: string; count: number }>
}

const KpiTile = ({
  label,
  value,
  deltaPp,
  deltaPct,
}: {
  label: string
  value: string
  deltaPp?: number | null
  deltaPct?: number | null
}) => {
  const delta = deltaPp ?? deltaPct ?? null
  const positive = (delta ?? 0) >= 0
  const suffix = deltaPp != null ? "pp" : deltaPct != null ? "%" : ""
  return (
    <div className="flex flex-col gap-y-0.5 px-3 py-2 rounded-md bg-ui-bg-subtle/50">
      <Text size="xsmall" className="text-ui-fg-subtle">
        {label}
      </Text>
      <Text className="text-2xl font-semibold tabular-nums">{value}</Text>
      {delta != null ? (
        <Text
          size="xsmall"
          style={{ color: positive ? PALETTE.emerald600 : PALETTE.rose600 }}
        >
          {positive ? "+" : ""}
          {delta.toFixed(1)}
          {suffix} vs prior
        </Text>
      ) : null}
    </div>
  )
}

export const ReorderRateChart = ({
  fromIso,
  toIso,
regionId,
}: {
  fromIso: string
  toIso: string
  regionId: string | null
}) => {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    if (regionId) params.set("region_id", regionId)
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
  }, [fromIso, toIso, regionId])

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
      help={{
        title: "Reorder rate & repeat customers",
        body: "Two signals: how many customers placed more than one order in the window (repeat-customer rate), and what share of all order lines were created via the 'Re-order' button on order history (reorder-line share).",
        bullets: [
          "Repeat-customer rate is the broad loyalty signal. Healthy stores see 30–50% in any 90-day window once they've been running long enough.",
          "Reorder-line share validates the 'Re-order from history' feature — if it's high, customers are finding the button and using it. If it's near zero with otherwise good repeat rates, the button may be hidden.",
          "Repeat orders without using the re-order button = customers rebuilding the design from scratch each time. That's friction worth fixing in onboarding copy.",
        ],
      }}
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
        <KpiTile
          label="Repeat customer rate"
          value={`${repeatPct}%`}
          deltaPp={summary?.repeat_rate_delta_pp ?? null}
        />
        <KpiTile
          label="Avg orders / customer"
          value={(summary?.avg_orders_per_customer ?? 0).toFixed(2)}
        />
        <KpiTile
          label="Reorder line share"
          value={`${reorderSharePct}%`}
          deltaPp={summary?.reorder_share_delta_pp ?? null}
        />
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
