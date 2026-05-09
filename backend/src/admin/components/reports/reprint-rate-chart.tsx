import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import {
  DECORATION_METHOD_COLORS,
  DECORATION_METHOD_LABELS,
  PALETTE,
  type DecorationMethodKey,
} from "../../lib/reports/palette"
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

type Event = {
  order_id: string
  display_id: number | null
  rolled_back_at: string
  from_stage: string
  to_stage: string
  methods: string[]
  had_vectorization: boolean
  customer_email: string | null
}

type Response = {
  from: string
  to: string
  summary: {
    total_rollbacks: number
    affected_orders: number
    orders_worked: number
    reprint_rate_pct: number
    with_vectorization: number
  }
  by_source_stage: Array<{ stage: string; count: number }>
  by_method: Array<{ method: string; count: number }>
  recent_events: Event[]
}

export const ReprintRateChart = ({
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
    fetch(`/admin/reports/reprint-rate?${params.toString()}`, {
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
  const maxStageCount = (data?.by_source_stage ?? []).reduce(
    (m, s) => Math.max(m, s.count),
    0
  )
  const maxMethodCount = (data?.by_method ?? []).reduce(
    (m, s) => Math.max(m, s.count),
    0
  )

  return (
    <ReportCard
      title="Reprint / failure rate"
      caption="Stage rollbacks (e.g. quality_check → in_production) flag failed prints. Bucket by source stage to see *where* failures land, by decoration method to see *which* technique fails most."
      loading={loading}
      error={error}
      csv={
        !data || data.recent_events.length === 0
          ? undefined
          : {
              filenameBase: "reprint-events",
              build: () =>
                buildCsv(
                  [
                    "Order",
                    "Rolled back at",
                    "From stage",
                    "To stage",
                    "Methods",
                    "Vectorized?",
                    "Customer",
                  ],
                  data.recent_events.map((e) => [
                    e.display_id != null ? `#${e.display_id}` : e.order_id,
                    e.rolled_back_at,
                    STAGE_LABELS[e.from_stage] ?? e.from_stage,
                    STAGE_LABELS[e.to_stage] ?? e.to_stage,
                    e.methods.join(" + "),
                    e.had_vectorization ? "yes" : "no",
                    e.customer_email ?? "",
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Reprint events
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {summary?.total_rollbacks ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Affected orders
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {summary?.affected_orders ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Reprint rate
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums"
            style={{
              color:
                (summary?.reprint_rate_pct ?? 0) > 10
                  ? PALETTE.rose600
                  : (summary?.reprint_rate_pct ?? 0) > 5
                    ? PALETTE.amber600
                    : undefined,
            }}
          >
            {(summary?.reprint_rate_pct ?? 0).toFixed(1)}%
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            With vectorization
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {summary?.with_vectorization ?? 0}
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        {/* By source stage */}
        <div>
          <Text size="small" className="font-medium block mb-1">
            By source stage
          </Text>
          {(data?.by_source_stage ?? []).length === 0 ? (
            <Text size="xsmall" className="text-ui-fg-muted">
              No rollbacks in window.
            </Text>
          ) : (
            <div className="flex flex-col gap-y-1">
              {data?.by_source_stage.map((s) => {
                const widthPct =
                  maxStageCount > 0
                    ? Math.max(4, Math.round((s.count / maxStageCount) * 100))
                    : 0
                return (
                  <div key={s.stage} className="flex items-center gap-x-3">
                    <Text size="small" className="w-32 truncate">
                      {STAGE_LABELS[s.stage] ?? s.stage}
                    </Text>
                    <div className="flex-1 min-w-0">
                      <div className="h-3 rounded bg-ui-bg-subtle overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${widthPct}%`,
                            background: PALETTE.amber600,
                          }}
                        />
                      </div>
                    </div>
                    <Text
                      size="small"
                      className="tabular-nums w-12 text-right font-medium"
                    >
                      {s.count}
                    </Text>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* By method */}
        <div>
          <Text size="small" className="font-medium block mb-1">
            By decoration method
          </Text>
          {(data?.by_method ?? []).length === 0 ? (
            <Text size="xsmall" className="text-ui-fg-muted">
              No method data.
            </Text>
          ) : (
            <div className="flex flex-col gap-y-1">
              {data?.by_method.map((m) => {
                const widthPct =
                  maxMethodCount > 0
                    ? Math.max(4, Math.round((m.count / maxMethodCount) * 100))
                    : 0
                const color =
                  DECORATION_METHOD_COLORS[m.method as DecorationMethodKey] ??
                  PALETTE.slate500
                const label =
                  DECORATION_METHOD_LABELS[m.method as DecorationMethodKey] ??
                  m.method
                return (
                  <div key={m.method} className="flex items-center gap-x-3">
                    <Text size="small" className="w-32 truncate">
                      {label}
                    </Text>
                    <div className="flex-1 min-w-0">
                      <div className="h-3 rounded bg-ui-bg-subtle overflow-hidden">
                        <div
                          className="h-full"
                          style={{ width: `${widthPct}%`, background: color }}
                        />
                      </div>
                    </div>
                    <Text
                      size="small"
                      className="tabular-nums w-12 text-right font-medium"
                    >
                      {m.count}
                    </Text>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {data && data.recent_events.length > 0 ? (
        <div className="mt-4">
          <Text size="small" className="font-medium block mb-1">
            Recent reprint events
          </Text>
          <div className="overflow-auto max-h-[280px]">
            <table className="w-full text-xs">
              <thead className="text-left text-ui-fg-subtle">
                <tr className="border-b border-ui-border-base">
                  <th className="px-2 py-1 font-medium">Order</th>
                  <th className="px-2 py-1 font-medium">When</th>
                  <th className="px-2 py-1 font-medium">From → to</th>
                  <th className="px-2 py-1 font-medium">Methods</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_events.map((e) => (
                  <tr
                    key={e.order_id + e.rolled_back_at}
                    className="border-b border-ui-border-base hover:bg-ui-bg-subtle cursor-pointer"
                    onClick={() => {
                      window.location.href = `/app/orders/${e.order_id}`
                    }}
                  >
                    <td className="px-2 py-1 tabular-nums font-medium">
                      {e.display_id != null
                        ? `#${e.display_id}`
                        : e.order_id.slice(0, 8)}
                    </td>
                    <td className="px-2 py-1 text-ui-fg-muted tabular-nums">
                      {new Date(e.rolled_back_at).toLocaleDateString("en-AU", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-2 py-1">
                      <span className="text-ui-fg-muted">
                        {STAGE_LABELS[e.from_stage] ?? e.from_stage}
                      </span>{" "}
                      →{" "}
                      <span className="font-medium">
                        {STAGE_LABELS[e.to_stage] ?? e.to_stage}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-ui-fg-muted truncate max-w-[200px]">
                      {e.methods.join(", ")}
                      {e.had_vectorization ? " · vectorized" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </ReportCard>
  )
}
