import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { COLOR_HEX_BY_KEY } from "./annotations-manager"

type Annotation = {
  id: string
  date: string
  label: string
  description: string | null
  color: string
}

type StatusKey = string
type TopRegion = { region_id: string; region_name: string; revenue: number }
type SeriesPoint = {
  bucket: string
  orders: number
  revenue: number
  yoy_orders?: number
  yoy_revenue?: number
}

type Response = {
  from: string
  to: string
  granularity: "day" | "week"
  currency: string
  summary: {
    orders: number
    revenue: number
    aov: number
    distinct_customers: number
    prior_orders: number
    prior_revenue: number
    prior_aov: number
    prior_distinct_customers: number
    orders_delta_pct: number | null
    revenue_delta_pct: number | null
    aov_delta_pct: number | null
  }
  series: SeriesPoint[]
  top_regions: TopRegion[]
  status_breakdown: Array<{ status: StatusKey; count: number }>
}

const STATUS_COLORS: Record<string, string> = {
  pending: PALETTE.amber600,
  completed: PALETTE.emerald600,
  archived: PALETTE.stone400,
  canceled: PALETTE.rose600,
  requires_action: PALETTE.amber600,
}

const formatCurrency = (n: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency.toUpperCase() || "AUD",
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `$${Math.round(n)}`
  }
}

const KpiTile = ({
  label,
  value,
  delta,
}: {
  label: string
  value: string
  delta?: number | null
}) => {
  const positive = (delta ?? 0) >= 0
  return (
    <div className="flex flex-col gap-y-0.5 px-3 py-3 rounded-md bg-ui-bg-subtle/50">
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
          {delta.toFixed(1)}% vs prior
        </Text>
      ) : (
        <Text size="xsmall" className="text-ui-fg-muted">
          no prior data
        </Text>
      )}
    </div>
  )
}

export const SalesOverviewTab = ({
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
  const [annotations, setAnnotations] = useState<Annotation[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    if (regionId) params.set("region_id", regionId)
    fetch(`/admin/reports/sales-overview?${params.toString()}`, {
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

  // Annotations overlay — fetched in parallel and best-effort: failure
  // here just means no overlay, the chart still renders normally.
  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    fetch(`/admin/reports/annotations?${params.toString()}`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : { annotations: [] }))
      .then((j) => {
        if (cancelled) return
        setAnnotations((j?.annotations as Annotation[]) ?? [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [fromIso, toIso])

  // Map annotation dates onto the chart's bucket keys. The series uses
  // `bucket: "YYYY-MM-DD"` for both daily + weekly granularity so a
  // direct date-key comparison works for the daily case. For weekly
  // granularity we round the annotation date down to the nearest bucket.
  const bucketsInChart = (data?.series ?? []).map((p) => p.bucket)
  const annotationLines = annotations
    .map((a) => {
      let bucket = a.date
      if (data?.granularity === "week" && bucketsInChart.length > 0) {
        // Find the latest bucket whose start ≤ annotation date.
        const annoMs = Date.parse(a.date)
        let chosen: string | null = null
        for (const b of bucketsInChart) {
          const bMs = Date.parse(b)
          if (Number.isFinite(bMs) && bMs <= annoMs) chosen = b
        }
        if (chosen) bucket = chosen
      }
      if (!bucketsInChart.includes(bucket)) return null
      return { ...a, bucket }
    })
    .filter((x): x is Annotation & { bucket: string } => x !== null)

  const summary = data?.summary
  const currency = data?.currency ?? "aud"

  return (
    <div className="grid grid-cols-1 gap-3">
      {/* KPI tiles row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile
          label="Total orders"
          value={String(summary?.orders ?? 0)}
          delta={summary?.orders_delta_pct ?? null}
        />
        <KpiTile
          label="Total sales"
          value={formatCurrency(summary?.revenue ?? 0, currency)}
          delta={summary?.revenue_delta_pct ?? null}
        />
        <KpiTile
          label="Average order value"
          value={formatCurrency(summary?.aov ?? 0, currency)}
          delta={summary?.aov_delta_pct ?? null}
        />
        <KpiTile
          label="Distinct customers"
          value={String(summary?.distinct_customers ?? 0)}
        />
      </div>

      {/* Time series — sales over time */}
      <ReportCard
        title="Sales over time"
        caption={`${data?.granularity === "week" ? "Weekly" : "Daily"} totals over the selected window. Dashed grey line is the same window 365 days ago — for like-for-like comparison rather than rolling 30d.`}
        help={{
          title: "Sales over time",
          body: "Revenue per day or week across the selected window. The dashed grey line is the same dates 365 days ago — a like-for-like seasonal benchmark rather than a rolling trailing comparison.",
          bullets: [
            "Pinned annotations from the strip above appear as vertical guides — useful for explaining spikes (campaigns, supplier delays, outages).",
            "Compare against the orders chart below: rising sales + flat orders means AOV is climbing (you're winning on basket size, not acquisition).",
            "Granularity flips automatically — narrow ranges (≤14 days) group daily, wider ranges group weekly.",
          ],
        }}
        loading={loading}
        error={error}
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data?.series ?? []}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PALETTE.teal700} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={PALETTE.teal700} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
              <XAxis
                dataKey="bucket"
                tick={{ fontSize: 10, fill: PALETTE.slate500 }}
                stroke={PALETTE.stone400}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: PALETTE.slate500 }}
                stroke={PALETTE.stone400}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
              />
              <Tooltip
                contentStyle={{
                  background: PALETTE.stone50,
                  border: `1px solid ${PALETTE.stone200}`,
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(value: any, name: string) => {
                  if (name === "revenue") return [formatCurrency(Number(value), currency), "Revenue"]
                  if (name === "yoy_revenue")
                    return [formatCurrency(Number(value), currency), "vs LY (same date)"]
                  return [value, name]
                }}
              />
              <Area
                type="monotone"
                dataKey="yoy_revenue"
                stroke={PALETTE.stone400}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fill="none"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={PALETTE.teal700}
                strokeWidth={2}
                fill="url(#revGradient)"
              />
              {annotationLines.map((a) => (
                <ReferenceLine
                  key={a.id}
                  x={a.bucket}
                  stroke={COLOR_HEX_BY_KEY[a.color] ?? PALETTE.slate700}
                  strokeDasharray="3 3"
                  label={{
                    value: a.label,
                    position: "top",
                    fill: COLOR_HEX_BY_KEY[a.color] ?? PALETTE.slate700,
                    fontSize: 10,
                  }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ReportCard>

      {/* Orders over time */}
      <ReportCard
        title="Orders over time"
        caption="Order count per bucket. Compare against the sales chart above — a flat order count with rising sales means AOV is climbing (you're winning on basket size, not customer acquisition)."
        help={{
          title: "Orders over time",
          body: "Order count per bucket — the volume side of the revenue equation. The dashed grey line shows last year's count for the same dates.",
          bullets: [
            "Flat orders + rising revenue → AOV is up (basket size winning, not acquisition).",
            "Flat revenue + rising orders → AOV is down (discount creep, lower-margin SKUs, smaller bulk orders).",
            "A sudden orders dip without revenue change usually means one or two big-ticket orders carried the day — risk if they don't repeat.",
          ],
        }}
        loading={loading}
        error={error}
      >
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data?.series ?? []}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PALETTE.slate700} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={PALETTE.slate700} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
              <XAxis
                dataKey="bucket"
                tick={{ fontSize: 10, fill: PALETTE.slate500 }}
                stroke={PALETTE.stone400}
                tickFormatter={(v: string) => v.slice(5)}
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
              <Area
                type="monotone"
                dataKey="yoy_orders"
                stroke={PALETTE.stone400}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fill="none"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="orders"
                stroke={PALETTE.slate700}
                strokeWidth={2}
                fill="url(#ordersGradient)"
              />
              {annotationLines.map((a) => (
                <ReferenceLine
                  key={a.id}
                  x={a.bucket}
                  stroke={COLOR_HEX_BY_KEY[a.color] ?? PALETTE.slate700}
                  strokeDasharray="3 3"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ReportCard>

      {/* Two-column grid — top regions + status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ReportCard
          title="Top regions by sales"
          help={{
            title: "Top regions by sales",
            body: "Revenue ranked by Medusa region in the selected window. Driven by the region attached to each order at checkout — typically tied to currency / country.",
            bullets: [
              "High revenue but low order count = wholesale or team buyers worth nurturing one-on-one.",
              "Use this to prioritise where region-specific shipping promos or copy would land.",
              "If a region you expected is missing, check Settings → Regions to confirm it's enabled and has products assigned.",
            ],
          }}
          loading={loading}
          error={error}
        >
          {!data || data.top_regions.length === 0 ? (
            <Text size="xsmall" className="text-ui-fg-muted">
              No regional sales in period.
            </Text>
          ) : (
            <div className="flex flex-col gap-y-1">
              {data.top_regions.map((r, i) => {
                const max = data.top_regions[0].revenue || 1
                const widthPct = Math.max(4, Math.round((r.revenue / max) * 100))
                return (
                  <div key={r.region_id} className="flex items-center gap-x-3">
                    <Text size="xsmall" className="w-5 text-ui-fg-muted tabular-nums">
                      {i + 1}.
                    </Text>
                    <div className="flex-1 min-w-0">
                      <Text size="small" className="truncate">
                        {r.region_name}
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
                    <Text size="small" className="tabular-nums w-20 text-right">
                      {formatCurrency(r.revenue, currency)}
                    </Text>
                  </div>
                )
              })}
            </div>
          )}
        </ReportCard>

        <ReportCard
          title="Order status breakdown"
          help={{
            title: "Order status breakdown",
            body: "Distribution of orders by Medusa status — pending / completed / archived / canceled. Reflects checkout completion, not production progress (use the Production tab for that).",
            bullets: [
              "A heavy 'pending' tail without payment usually means abandoned guest checkouts; cross-check Cart-to-order conversion below.",
              "Sustained 'requires_action' means Stripe is asking for 3DS confirmation that customers aren't completing — review fraud rules.",
              "Steady 'canceled' >5% in a window is worth digging into — usually a product issue or shipping shock.",
            ],
          }}
          loading={loading}
          error={error}
        >
          {!data || data.status_breakdown.length === 0 ? (
            <Text size="xsmall" className="text-ui-fg-muted">
              No orders in period.
            </Text>
          ) : (
            <div className="flex flex-col gap-y-1">
              {data.status_breakdown.map((s) => {
                const max = data.status_breakdown[0].count || 1
                const widthPct = Math.max(4, Math.round((s.count / max) * 100))
                return (
                  <div key={s.status} className="flex items-center gap-x-3">
                    <div className="flex-1 min-w-0">
                      <Text size="small" className="capitalize truncate">
                        {s.status.replace(/_/g, " ")}
                      </Text>
                      <div className="h-2 mt-1 rounded bg-ui-bg-subtle overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: `${widthPct}%`,
                            background: STATUS_COLORS[s.status] ?? PALETTE.slate700,
                          }}
                        />
                      </div>
                    </div>
                    <Text size="small" className="tabular-nums w-12 text-right">
                      {s.count}
                    </Text>
                  </div>
                )
              })}
            </div>
          )}
        </ReportCard>
      </div>
    </div>
  )
}
