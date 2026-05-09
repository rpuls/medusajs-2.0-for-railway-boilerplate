import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { EmptyState } from "./empty-state"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

const STAGE_LABELS: Record<string, string> = {
  received: "Received",
  art_review: "Art review",
  awaiting_approval: "Awaiting approval",
  approved: "Approved",
  blanks_ordered: "Blanks ordered",
  blanks_arrived: "Blanks received",
  in_production: "In production",
  quality_check: "Quality check",
  shipped: "Shipped",
  delivered: "Delivered",
}

type Order = {
  order_id: string
  display_id: number | null
  transitions: number
  rollbacks: number
  customer_email: string | null
  final_stage: string | null
}

type Response = {
  from: string
  to: string
  summary: {
    orders_touched: number
    total_transitions: number
    avg_transitions_per_order: number
    total_rollbacks: number
    rollback_rate_pct: number
  }
  distribution: Array<{ range: string; min: number; max: number; count: number }>
  high_edit_orders: Order[]
}

export const OrderEditFrequencyChart = ({
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
  const [loadedAt, setLoadedAt] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    if (regionId) params.set("region_id", regionId)
    fetch(`/admin/reports/order-edit-frequency?${params.toString()}`, {
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((j) => {
        if (!cancelled) {
          setData(j as Response)
          setLoadedAt(Date.now())
        }
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
  const distribution = data?.distribution ?? []
  const maxCount = distribution.reduce((m, d) => Math.max(m, d.count), 0)
  const high = data?.high_edit_orders ?? []

  return (
    <ReportCard
      title="Order edit frequency"
      caption="Process-maturity proxy. Average stage transitions per order — more than the canonical 9 means excessive revisions / rollbacks. Trending up = onboarding new customers without clear briefs; trending down = your storefront is getting clearer."
      help="Counts production_stage_history transitions where the *exit* timestamp falls in window. Rollbacks are transitions to a stage with a lower index in the canonical stage list (i.e. backwards). Top 20 by transition count are listed for staff review."
      loading={loading}
      error={error}
      loadedAt={loadedAt}
      csv={
        high.length === 0
          ? undefined
          : {
              filenameBase: "order-edit-frequency",
              build: () =>
                buildCsv(
                  ["Order", "Customer", "Transitions", "Rollbacks", "Final stage"],
                  high.map((o) => [
                    o.display_id != null ? `#${o.display_id}` : o.order_id,
                    o.customer_email ?? "",
                    o.transitions,
                    o.rollbacks,
                    STAGE_LABELS[o.final_stage ?? ""] ?? o.final_stage ?? "",
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Orders worked
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {summary?.orders_touched ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Avg transitions / order
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums"
            style={{
              color:
                (summary?.avg_transitions_per_order ?? 0) > 12
                  ? PALETTE.amber600
                  : undefined,
            }}
          >
            {(summary?.avg_transitions_per_order ?? 0).toFixed(1)}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Rollback rate
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums"
            style={{
              color:
                (summary?.rollback_rate_pct ?? 0) > 10
                  ? PALETTE.rose600
                  : undefined,
            }}
          >
            {(summary?.rollback_rate_pct ?? 0).toFixed(1)}%
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Total transitions
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {summary?.total_transitions ?? 0}
          </Text>
        </div>
      </div>

      {distribution.length > 0 && summary && summary.orders_touched > 0 ? (
        <div className="mt-3">
          <Text size="small" className="font-medium block mb-1">
            Transition distribution
          </Text>
          <div className="flex flex-col gap-y-1">
            {distribution.map((d) => {
              const widthPct =
                maxCount > 0
                  ? Math.max(2, Math.round((d.count / maxCount) * 100))
                  : 0
              const colorByRange =
                d.range === "10+" ? PALETTE.rose600 :
                d.range === "6-9" ? PALETTE.amber600 :
                PALETTE.teal700
              return (
                <div key={d.range} className="flex items-center gap-x-3">
                  <Text size="small" className="w-16">
                    {d.range}
                  </Text>
                  <div className="flex-1 min-w-0">
                    <div className="h-3 rounded bg-ui-bg-subtle overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${widthPct}%`,
                          background: colorByRange,
                        }}
                      />
                    </div>
                  </div>
                  <Text size="small" className="tabular-nums w-12 text-right font-medium">
                    {d.count}
                  </Text>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {high.length === 0 ? (
        <EmptyState
          title="No order activity in window"
          body="No orders had stage transitions in the selected date range. This typically means production_stage_history isn't populated yet — orders placed before the production-stage tracker shipped won't appear."
        />
      ) : (
        <div className="mt-3">
          <Text size="small" className="font-medium block mb-1">
            Most-edited orders
          </Text>
          <div className="overflow-auto max-h-[280px]">
            <table className="w-full text-xs">
              <thead className="text-left text-ui-fg-subtle">
                <tr className="border-b border-ui-border-base">
                  <th className="px-2 py-1 font-medium">Order</th>
                  <th className="px-2 py-1 font-medium text-right">Transitions</th>
                  <th className="px-2 py-1 font-medium text-right">Rollbacks</th>
                  <th className="px-2 py-1 font-medium">Now at</th>
                  <th className="px-2 py-1 font-medium">Customer</th>
                </tr>
              </thead>
              <tbody>
                {high.map((o) => (
                  <tr
                    key={o.order_id}
                    className="border-b border-ui-border-base hover:bg-ui-bg-subtle cursor-pointer"
                    onClick={() => {
                      window.location.href = `/app/orders/${o.order_id}`
                    }}
                  >
                    <td className="px-2 py-1 tabular-nums font-medium">
                      {o.display_id != null
                        ? `#${o.display_id}`
                        : o.order_id.slice(0, 8)}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right">
                      {o.transitions}
                    </td>
                    <td
                      className="px-2 py-1 tabular-nums text-right"
                      style={
                        o.rollbacks > 0
                          ? { color: PALETTE.rose600 }
                          : undefined
                      }
                    >
                      {o.rollbacks}
                    </td>
                    <td className="px-2 py-1 text-ui-fg-muted">
                      {STAGE_LABELS[o.final_stage ?? ""] ?? o.final_stage ?? "—"}
                    </td>
                    <td className="px-2 py-1 truncate max-w-[200px] text-ui-fg-muted">
                      {o.customer_email ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ReportCard>
  )
}
