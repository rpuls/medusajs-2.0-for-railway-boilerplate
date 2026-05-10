import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ReportCard } from "./report-card"
import { buildCsv } from "../../lib/reports/csv"
import { DECORATION_METHOD_LABELS, PALETTE } from "../../lib/reports/palette"

type TrendRow = {
  week: string
  on_time: number
  late: number
  total: number
  rate: number | null
}

type MethodRow = {
  method: string
  on_time: number
  late: number
  rate: number | null
}

type RushRow = {
  type: string
  on_time: number
  late: number
  rate: number | null
}

type Response = {
  from: string
  to: string
  overall_rate: number | null
  evaluated_count: number
  on_time_count: number
  late_count: number
  no_due_date_count: number
  trend: TrendRow[]
  by_method: MethodRow[]
  rush_vs_standard: RushRow[]
}

export const OnTimeDeliveryChart = ({
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
    fetch(`/admin/reports/on-time-delivery?${params.toString()}`, {
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

  const rateDisplay =
    data?.overall_rate != null ? `${data.overall_rate}%` : "—"

  const rateColor =
    data?.overall_rate == null
      ? undefined
      : data.overall_rate >= 90
        ? PALETTE.emerald600
        : data.overall_rate >= 75
          ? PALETTE.amber600
          : PALETTE.rose600

  const trendRows = (data?.trend ?? []).map((t) => ({
    week: t.week.slice(5),
    rate: t.rate,
    on_time: t.on_time,
    late: t.late,
    total: t.total,
  }))

  const methodRows = (data?.by_method ?? []).map((m) => ({
    method:
      (DECORATION_METHOD_LABELS as Record<string, string>)[m.method] ?? m.method,
    rate: m.rate,
    on_time: m.on_time,
    late: m.late,
    total: m.on_time + m.late,
  }))

  const rushRows = (data?.rush_vs_standard ?? []).map((r) => ({
    type: r.type === "rush" ? "Rush" : "Standard",
    rate: r.rate,
    on_time: r.on_time,
    late: r.late,
    total: r.on_time + r.late,
  }))

  const tooltipStyle = {
    background: PALETTE.stone50,
    border: `1px solid ${PALETTE.stone200}`,
    borderRadius: 6,
    fontSize: 12,
  }

  return (
    <ReportCard
      title="On-time delivery rate"
      caption={
        data
          ? `${data.evaluated_count} orders evaluated · ${data.late_count} late · ${data.no_due_date_count} had no due date set`
          : "% of shipped orders delivered on or before their production due date."
      }
      help={{
        title: "On-time delivery rate",
        body: "The percentage of shipped orders delivered on or before their production_due_date. Only orders that have both a production_due_date set AND a 'shipped' entry in their stage history are evaluated. Orders shipped in the selected window but missing a due date are counted separately.",
        bullets: [
          "Rate <90%: compare against the Capacity Forecast — the pipeline may be overloaded.",
          "Rush vs standard gap >15%: check whether the rush SLA is realistic for your team.",
          "'No due date' count is a data quality issue, not a performance issue — set production_due_date at intake on every confirmed order.",
          "If a specific decoration method drags the rate down, check Time-in-Stage for that method to find the bottleneck stage.",
          "The 90% reference line on the trend chart is a typical print-shop benchmark — calibrate your own target against customer commitments.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        !data || data.trend.length === 0
          ? undefined
          : {
              filenameBase: "on-time-delivery",
              build: () =>
                buildCsv(
                  ["Week", "On time", "Late", "Total", "Rate (%)"],
                  data.trend.map((t) => [
                    t.week,
                    t.on_time,
                    t.late,
                    t.total,
                    t.rate != null ? t.rate.toFixed(1) + "%" : "",
                  ])
                ),
            }
      }
    >
      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50 col-span-2 lg:col-span-2">
          <Text size="xsmall" className="text-ui-fg-subtle">
            On-time rate
          </Text>
          <Text
            className="text-4xl font-semibold tabular-nums leading-tight mt-0.5"
            style={{ color: rateColor }}
          >
            {rateDisplay}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Evaluated orders
          </Text>
          <Text className="text-2xl font-semibold tabular-nums leading-tight mt-0.5">
            {data?.evaluated_count ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Late
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums leading-tight mt-0.5"
            style={{
              color: (data?.late_count ?? 0) > 0 ? PALETTE.rose600 : undefined,
            }}
          >
            {data?.late_count ?? 0}
          </Text>
        </div>
      </div>

      {(data?.no_due_date_count ?? 0) > 0 && (
        <Text size="xsmall" className="text-ui-fg-muted mt-2 block">
          {data!.no_due_date_count} shipped orders had no production due date set
          and were excluded. Set production_due_date on orders at intake to
          include them in this report.
        </Text>
      )}

      {/* Weekly trend line chart */}
      {trendRows.length > 1 && (
        <div className="mt-4">
          <Text size="small" className="font-medium block mb-1">
            Weekly on-time rate
          </Text>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendRows}
                margin={{ top: 4, right: 16, left: 0, bottom: 8 }}
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
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: any, _name: string, item: any) => {
                    const row = item?.payload
                    return [
                      `${value != null ? value : "—"}% (${row?.on_time} on time, ${row?.late} late)`,
                      "Rate",
                    ]
                  }}
                />
                <ReferenceLine
                  y={90}
                  stroke={PALETTE.emerald600}
                  strokeDasharray="4 4"
                  label={{
                    value: "90%",
                    fontSize: 10,
                    fill: PALETTE.emerald600,
                    position: "insideTopRight",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke={PALETTE.slate700}
                  strokeWidth={2}
                  dot={{ fill: PALETTE.slate700, r: 3 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Breakdown: by method + rush vs standard */}
      {(methodRows.length > 0 || rushRows.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
          {methodRows.length > 0 && (
            <div>
              <Text size="small" className="font-medium block mb-1">
                By decoration method
              </Text>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={methodRows}
                    layout="vertical"
                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 10, fill: PALETTE.slate500 }}
                      stroke={PALETTE.stone400}
                    />
                    <YAxis
                      dataKey="method"
                      type="category"
                      tick={{ fontSize: 10, fill: PALETTE.slate700 }}
                      width={110}
                      stroke={PALETTE.stone400}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: any, _: string, item: any) => {
                        const row = item?.payload
                        return [
                          `${value != null ? value : "—"}% (${row?.on_time}/${row?.total})`,
                          "On-time rate",
                        ]
                      }}
                    />
                    <Bar
                      dataKey="rate"
                      fill={PALETTE.teal700}
                      radius={[0, 3, 3, 0]}
                      maxBarSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {rushRows.length > 0 && (
            <div>
              <Text size="small" className="font-medium block mb-1">
                Rush vs standard
              </Text>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={rushRows}
                    layout="vertical"
                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 10, fill: PALETTE.slate500 }}
                      stroke={PALETTE.stone400}
                    />
                    <YAxis
                      dataKey="type"
                      type="category"
                      tick={{ fontSize: 10, fill: PALETTE.slate700 }}
                      width={70}
                      stroke={PALETTE.stone400}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: any, _: string, item: any) => {
                        const row = item?.payload
                        return [
                          `${value != null ? value : "—"}% (${row?.on_time}/${row?.total})`,
                          "On-time rate",
                        ]
                      }}
                    />
                    <Bar
                      dataKey="rate"
                      fill={PALETTE.slate700}
                      radius={[0, 3, 3, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </ReportCard>
  )
}
