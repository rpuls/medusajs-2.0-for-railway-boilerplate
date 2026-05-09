import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
  delivered: "Delivered",
}

type StageRow = {
  stage: string
  sla_days: number | null
  transitions: number
  on_time: number
  breach: number
  severe_breach: number
  breach_pct: number
  severe_pct: number
  median_overage_days: number
}

type TrendRow = {
  week: string
  transitions: number
  breaches: number
  breach_pct: number
}

type Breaching = {
  order_id: string
  display_id: number | null
  stage: string
  days_at_stage: number
  sla_days: number | null
  customer_email: string | null
  overage: number
}

type Response = {
  from: string
  to: string
  by_stage: StageRow[]
  trend: TrendRow[]
  currently_breaching: Breaching[]
  currently_breaching_total: number
}

export const SlaBreachChart = ({
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
    fetch(`/admin/reports/sla-breach?${params.toString()}`, {
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

  const stageRows = (data?.by_stage ?? []).map((s) => ({
    stage: STAGE_LABELS[s.stage] ?? s.stage,
    on_time: s.on_time,
    breach: s.breach,
    severe_breach: s.severe_breach,
    breach_pct: s.breach_pct,
    transitions: s.transitions,
    sla: s.sla_days,
  }))

  const trendRows = (data?.trend ?? []).map((t) => ({
    week: t.week.slice(5),
    breach_pct: t.breach_pct,
    breaches: t.breaches,
    transitions: t.transitions,
  }))

  return (
    <ReportCard
      title="Stage SLA breach"
      caption="On-time vs breach (1-2× SLA) vs severe breach (>2× SLA), per stage. SLAs are defined in backend/src/lib/production-stage.ts. Stages with no recent transitions show no bars; calibrate SLAs against real data, not gut feel."
      help={{
        title: "Stage SLA breach",
        body: "For each production stage, the share of orders that exited on-time, in breach (1–2× the SLA), or in severe breach (>2× the SLA). Pinpoints where the pipeline drags so you fix the right stage, not the symptom.",
        bullets: [
          "If 'art_review' is your worst breach, the bottleneck is reviewer capacity — not production. No amount of press time will fix it.",
          "Severe-breach orders almost always hide a process gap (waiting on customer approval, missing artwork). Tag and triage them weekly.",
          "SLAs live in backend/src/lib/production-stage.ts. If a stage shows >30% breach week-over-week, the SLA is wrong, not the team — bump it to match reality.",
          "Stages with no recent transitions show no bars; just means nothing exited that stage in the window.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        !data || data.by_stage.length === 0
          ? undefined
          : {
              filenameBase: "sla-breach",
              build: () =>
                buildCsv(
                  [
                    "Stage",
                    "SLA (days)",
                    "Transitions",
                    "On time",
                    "Breach",
                    "Severe breach",
                    "Breach %",
                    "Median overage (days)",
                  ],
                  data.by_stage.map((s) => [
                    STAGE_LABELS[s.stage] ?? s.stage,
                    s.sla_days ?? "",
                    s.transitions,
                    s.on_time,
                    s.breach,
                    s.severe_breach,
                    s.breach_pct.toFixed(1) + "%",
                    s.median_overage_days,
                  ])
                ),
            }
      }
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stageRows}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            stackOffset="expand"
          >
            <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              tick={{ fontSize: 11, fill: PALETTE.slate500 }}
              stroke={PALETTE.stone400}
            />
            <YAxis
              dataKey="stage"
              type="category"
              tick={{ fontSize: 11, fill: PALETTE.slate700 }}
              width={120}
              stroke={PALETTE.stone400}
            />
            <Tooltip
              contentStyle={{
                background: PALETTE.stone50,
                border: `1px solid ${PALETTE.stone200}`,
                borderRadius: 6,
                fontSize: 12,
              }}
              formatter={(value: any, name: string, item: any) => {
                const total = item?.payload?.transitions ?? 0
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0"
                if (name === "on_time") return [`${value} (${pct}%)`, "On time"]
                if (name === "breach") return [`${value} (${pct}%)`, "Breach"]
                if (name === "severe_breach")
                  return [`${value} (${pct}%)`, "Severe breach"]
                return [value, name]
              }}
              labelFormatter={(label, payload) => {
                const row = payload?.[0]?.payload as any
                const sla = row?.sla
                const total = row?.transitions ?? 0
                return `${label}${sla != null ? ` · SLA ${sla}d` : ""} · ${total} transitions`
              }}
            />
            <Bar
              dataKey="on_time"
              stackId="band"
              fill={PALETTE.emerald600}
              maxBarSize={18}
            />
            <Bar
              dataKey="breach"
              stackId="band"
              fill={PALETTE.amber600}
              maxBarSize={18}
            />
            <Bar
              dataKey="severe_breach"
              stackId="band"
              fill={PALETTE.rose600}
              maxBarSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {trendRows.length > 1 ? (
        <div className="h-32 mt-2">
          <Text size="xsmall" className="text-ui-fg-subtle mb-1 block">
            Weekly breach % (overall)
          </Text>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendRows}
              margin={{ top: 4, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: PALETTE.slate500 }}
                stroke={PALETTE.stone400}
              />
              <YAxis
                tick={{ fontSize: 10, fill: PALETTE.slate500 }}
                tickFormatter={(v) => `${v}%`}
                stroke={PALETTE.stone400}
              />
              <Tooltip
                contentStyle={{
                  background: PALETTE.stone50,
                  border: `1px solid ${PALETTE.stone200}`,
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(value: any) => [`${value}%`, "Breach"]}
              />
              <Line
                type="monotone"
                dataKey="breach_pct"
                stroke={PALETTE.amber600}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {data && data.currently_breaching.length > 0 ? (
        <div className="mt-3">
          <div className="flex items-baseline justify-between mb-1">
            <Text size="small" className="font-medium">
              Currently breaching ({data.currently_breaching_total})
            </Text>
            <a
              className="text-xs underline text-ui-fg-subtle"
              href="/app/production?stuck=1"
            >
              Open in Production →
            </a>
          </div>
          <div className="overflow-auto max-h-[240px]">
            <table className="w-full text-xs">
              <thead className="text-left text-ui-fg-subtle">
                <tr className="border-b border-ui-border-base">
                  <th className="px-2 py-1 font-medium">Order</th>
                  <th className="px-2 py-1 font-medium">Stage</th>
                  <th className="px-2 py-1 font-medium text-right">Days</th>
                  <th className="px-2 py-1 font-medium text-right">Overage</th>
                  <th className="px-2 py-1 font-medium">Customer</th>
                </tr>
              </thead>
              <tbody>
                {data.currently_breaching.map((b) => (
                  <tr
                    key={b.order_id}
                    className="border-b border-ui-border-base hover:bg-ui-bg-subtle cursor-pointer"
                    onClick={() => {
                      window.location.href = `/app/orders/${b.order_id}`
                    }}
                  >
                    <td className="px-2 py-1 tabular-nums font-medium">
                      {b.display_id != null ? `#${b.display_id}` : b.order_id.slice(0, 8)}
                    </td>
                    <td className="px-2 py-1 text-ui-fg-muted">
                      {STAGE_LABELS[b.stage] ?? b.stage}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right">
                      {b.days_at_stage}d
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right" style={{ color: PALETTE.rose600 }}>
                      +{b.overage}d
                    </td>
                    <td className="px-2 py-1 truncate text-ui-fg-muted">
                      {b.customer_email ?? "—"}
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
