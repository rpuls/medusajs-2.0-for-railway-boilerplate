import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ReportCard } from "./report-card"
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
}

type OpenOrder = {
  order_id: string
  display_id: number | null
  customer_email: string | null
  current_stage: string
  days_at_current_stage: number
  methods: string[]
  work_days_remaining: number
  projected_ship_at: string
  total: number
  currency_code: string
}

type Response = {
  summary: {
    pipeline_orders: number
    pipeline_work_days: number
    throughput_per_day: number
    shipped_last_30_days: number
    days_of_work_in_pipeline: number | null
    capacity_status: "green" | "amber" | "red" | "unknown"
    ships_today: number
    ships_this_week: number
  }
  stage_load: Array<{ stage: string; count: number; sla_days: number | null }>
  projected_ships_by_week: Array<{
    week_start: string
    ships: number
    revenue: number
  }>
  open_orders: OpenOrder[]
}

const STATUS_COLOR: Record<Response["summary"]["capacity_status"], string> = {
  green: PALETTE.emerald600,
  amber: PALETTE.amber600,
  red: PALETTE.rose600,
  unknown: PALETTE.stone400,
}

const STATUS_LABEL: Record<Response["summary"]["capacity_status"], string> = {
  green: "Healthy",
  amber: "Watch",
  red: "Overloaded",
  unknown: "No baseline",
}

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
    })
  } catch {
    return iso.slice(0, 10)
  }
}

export const CapacityChart = ({
  regionId: _regionId,
}: {
  fromIso: string
  toIso: string
  regionId: string | null
}) => {
  // Capacity is point-in-time, not period-bound — date range is ignored.
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (_regionId) params.set("region_id", _regionId)
    fetch(
      `/admin/reports/capacity${params.toString() ? `?${params}` : ""}`,
      { credentials: "include" }
    )
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
  }, [_regionId])

  const summary = data?.summary
  const status = summary?.capacity_status ?? "unknown"

  const stageRows = (data?.stage_load ?? []).map((s) => ({
    stage: STAGE_LABELS[s.stage] ?? s.stage,
    count: s.count,
    sla: s.sla_days,
  }))
  const weekRows = (data?.projected_ships_by_week ?? []).map((w) => ({
    week: formatDate(w.week_start),
    ships: w.ships,
    revenue: w.revenue,
  }))

  return (
    <ReportCard
      title="Production capacity forecast"
      caption="Open orders + projected ship dates from current stage and SLAs. Capacity status compares pipeline workload against the last-30-days throughput. Tells customers 'ETA Friday' with data, not gut feel."
      help={{
        title: "Production capacity forecast",
        body: "Every open order with a projected ship date based on its current stage plus the canonical SLAs. The capacity gauge weighs current pipeline workload against the last 30 days of throughput so you can answer 'when will it ship?' with data instead of gut feel.",
        bullets: [
          "Status 'overloaded' = the pipeline holds more days of work than your throughput can absorb on time. Either expedite, push out promises, or add a shift.",
          "Status 'tight' = working at capacity; any new big order will start slipping promised dates. A good time to pause new wholesale quotes.",
          "Projected ship dates assume the order moves through every remaining stage at the median dwell time. A particular order can run faster or slower — use it as a planning average, not a guarantee.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        !data || data.open_orders.length === 0
          ? undefined
          : {
              filenameBase: "capacity-open-orders",
              build: () =>
                buildCsv(
                  [
                    "Order",
                    "Customer",
                    "Current stage",
                    "Days at stage",
                    "Methods",
                    "Work days left",
                    "Projected ship",
                    "Total",
                  ],
                  data.open_orders.map((o) => [
                    o.display_id != null ? `#${o.display_id}` : o.order_id,
                    o.customer_email ?? "",
                    STAGE_LABELS[o.current_stage] ?? o.current_stage,
                    o.days_at_current_stage,
                    o.methods.join(" + "),
                    o.work_days_remaining,
                    o.projected_ship_at,
                    o.total,
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Pipeline orders
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {summary?.pipeline_orders ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Throughput / day
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {(summary?.throughput_per_day ?? 0).toFixed(1)}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Days of work in pipeline
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums"
            style={{ color: STATUS_COLOR[status] }}
          >
            {summary?.days_of_work_in_pipeline === null ||
            summary?.days_of_work_in_pipeline === undefined
              ? "—"
              : summary.days_of_work_in_pipeline}
            <span
              className="text-xs font-medium ml-2"
              style={{ color: STATUS_COLOR[status] }}
            >
              {STATUS_LABEL[status]}
            </span>
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Ships today
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {summary?.ships_today ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Ships this week
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {summary?.ships_this_week ?? 0}
          </Text>
        </div>
      </div>

      {/* Projected ships by week */}
      {weekRows.length > 0 ? (
        <div className="h-48 mt-4">
          <Text size="small" className="font-medium block mb-1">
            Projected ships per week
          </Text>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weekRows}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: PALETTE.slate500 }}
                stroke={PALETTE.stone400}
              />
              <YAxis
                tick={{ fontSize: 11, fill: PALETTE.slate500 }}
                stroke={PALETTE.stone400}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: PALETTE.stone50,
                  border: `1px solid ${PALETTE.stone200}`,
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="ships"
                fill={PALETTE.teal700}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {/* Stage load */}
      <div className="mt-4">
        <Text size="small" className="font-medium block mb-1">
          Pipeline by stage
        </Text>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {stageRows.map((s) => (
            <div
              key={s.stage}
              className="px-3 py-2 rounded-md bg-ui-bg-subtle/50"
            >
              <Text size="xsmall" className="text-ui-fg-subtle truncate">
                {s.stage}
              </Text>
              <Text className="text-lg font-semibold tabular-nums">
                {s.count}
                {s.sla != null ? (
                  <span className="text-xs font-medium text-ui-fg-muted ml-1">
                    ({s.sla}d SLA)
                  </span>
                ) : null}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {/* Open orders */}
      {data && data.open_orders.length > 0 ? (
        <div className="mt-4">
          <Text size="small" className="font-medium block mb-1">
            Open orders sorted by projected ship
          </Text>
          <div className="overflow-auto max-h-[360px]">
            <table className="w-full text-xs">
              <thead className="text-left text-ui-fg-subtle">
                <tr className="border-b border-ui-border-base">
                  <th className="px-2 py-1 font-medium">Order</th>
                  <th className="px-2 py-1 font-medium">Stage</th>
                  <th className="px-2 py-1 font-medium text-right">Days at</th>
                  <th className="px-2 py-1 font-medium text-right">Days left</th>
                  <th className="px-2 py-1 font-medium">Projected ship</th>
                  <th className="px-2 py-1 font-medium">Methods</th>
                </tr>
              </thead>
              <tbody>
                {data.open_orders.map((o) => (
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
                    <td className="px-2 py-1 text-ui-fg-muted">
                      {STAGE_LABELS[o.current_stage] ?? o.current_stage}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right">
                      {o.days_at_current_stage}d
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right font-medium">
                      {o.work_days_remaining}d
                    </td>
                    <td className="px-2 py-1 tabular-nums">
                      {formatDate(o.projected_ship_at)}
                    </td>
                    <td className="px-2 py-1 text-ui-fg-muted truncate max-w-[200px]">
                      {o.methods.join(", ")}
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
