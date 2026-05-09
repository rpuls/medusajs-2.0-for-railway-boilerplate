import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ReportCard } from "./report-card"
import { EmptyState } from "./empty-state"
import {
  DECORATION_METHOD_COLORS,
  DECORATION_METHOD_LABELS,
  PALETTE,
  type DecorationMethodKey,
} from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Response = {
  from: string
  to: string
  summary: {
    total_orders: number
    refunded_orders: number
    refund_rate_pct: number
    total_revenue: number
    total_refunded: number
    dollar_refund_rate_pct: number
  }
  by_method: Array<{
    method: string
    orders: number
    refunded: number
    refund_rate_pct: number
  }>
  weekly_trend: Array<{
    week: string
    orders: number
    refunded: number
    refund_rate_pct: number
  }>
  recent: Array<{
    order_id: string
    display_id: number | null
    refund_amount: number
    refunded_at: string | null
    note: string | null
    methods: string[]
  }>
}

const formatCurrency = (n: number) => {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `$${Math.round(n)}`
  }
}

export const RefundRateChart = ({
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
    fetch(`/admin/reports/refund-rate?${params.toString()}`, {
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
  const trend = (data?.weekly_trend ?? []).map((t) => ({
    week: t.week.slice(5),
    rate: t.refund_rate_pct,
  }))

  return (
    <ReportCard
      title="Refund rate"
      caption="% of orders with any refund (full or partial), trended weekly. Decoration-method breakdown surfaces which technique drives the most refunds."
      help="Reads order.refunds directly — works with or without an RMA workflow. The dollar refund rate is the dollars-refunded share of revenue and is often more meaningful than the count rate (a few high-value refunds can dwarf many small ones)."
      loading={loading}
      error={error}
      loadedAt={loadedAt}
      csv={
        !data || data.recent.length === 0
          ? undefined
          : {
              filenameBase: "refunds",
              build: () =>
                buildCsv(
                  ["Order", "Refunded at", "Amount", "Methods", "Note"],
                  data.recent.map((r) => [
                    r.display_id != null ? `#${r.display_id}` : r.order_id,
                    r.refunded_at ?? "",
                    r.refund_amount,
                    r.methods.join(" + "),
                    r.note ?? "",
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Refund rate (count)
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums"
            style={{
              color:
                (summary?.refund_rate_pct ?? 0) > 5
                  ? PALETTE.rose600
                  : (summary?.refund_rate_pct ?? 0) > 2
                    ? PALETTE.amber600
                    : undefined,
            }}
          >
            {(summary?.refund_rate_pct ?? 0).toFixed(1)}%
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Refund rate ($)
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {(summary?.dollar_refund_rate_pct ?? 0).toFixed(1)}%
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Refunded orders
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {summary?.refunded_orders ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Refunded $
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {formatCurrency(summary?.total_refunded ?? 0)}
          </Text>
        </div>
      </div>

      {trend.length > 1 ? (
        <div className="h-32 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trend}
              margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: PALETTE.slate500 }}
                stroke={PALETTE.stone400}
              />
              <YAxis
                tick={{ fontSize: 10, fill: PALETTE.slate500 }}
                stroke={PALETTE.stone400}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  background: PALETTE.stone50,
                  border: `1px solid ${PALETTE.stone200}`,
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(v: any) => [`${v}%`, "Refund rate"]}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke={PALETTE.rose600}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {data && data.by_method.length > 0 ? (
        <div className="mt-3">
          <Text size="small" className="font-medium block mb-1">
            By decoration method
          </Text>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {data.by_method.map((m) => (
              <div
                key={m.method}
                className="px-3 py-2 rounded-md bg-ui-bg-subtle/50"
                title={`${m.refunded} refunded / ${m.orders} orders`}
              >
                <div className="flex items-center gap-x-1.5 mb-0.5">
                  <span
                    className="w-2 h-2 rounded-sm"
                    style={{
                      background:
                        DECORATION_METHOD_COLORS[
                          m.method as DecorationMethodKey
                        ] ?? PALETTE.slate500,
                    }}
                  />
                  <Text size="xsmall" className="text-ui-fg-subtle truncate">
                    {DECORATION_METHOD_LABELS[
                      m.method as DecorationMethodKey
                    ] ?? m.method}
                  </Text>
                </div>
                <Text
                  className="text-base font-semibold tabular-nums"
                  style={{
                    color:
                      m.refund_rate_pct > 5
                        ? PALETTE.rose600
                        : m.refund_rate_pct > 2
                          ? PALETTE.amber600
                          : undefined,
                  }}
                >
                  {m.refund_rate_pct.toFixed(1)}%
                </Text>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {data && data.recent.length === 0 ? (
        <EmptyState
          title="No refunds in window"
          body="Either you've had a clean run or your refund flow happens outside Medusa. Refunds processed in Stripe directly without writing back to Medusa won't appear here."
        />
      ) : null}
    </ReportCard>
  )
}
