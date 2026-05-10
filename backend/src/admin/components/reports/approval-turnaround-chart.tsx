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
import { buildCsv } from "../../lib/reports/csv"
import { PALETTE } from "../../lib/reports/palette"

type TrendRow = {
  week: string
  median_hours: number | null
  count: number
}

type HistogramRow = {
  bucket: string
  count: number
}

type Response = {
  from: string
  to: string
  median_hours: number | null
  p90_hours: number | null
  pending_count: number
  evaluated_count: number
  trend: TrendRow[]
  histogram: HistogramRow[]
}

const formatHours = (h: number | null): string => {
  if (h == null) return "—"
  if (h >= 48) return `${(h / 24).toFixed(1)} d`
  return `${h.toFixed(1)} hrs`
}

export const ApprovalTurnaroundChart = ({
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
    fetch(`/admin/reports/approval-turnaround?${params.toString()}`, {
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

  const isEmpty = !loading && !error && (data?.evaluated_count ?? 0) === 0

  const medianColor =
    data?.median_hours == null
      ? undefined
      : data.median_hours <= 4
        ? PALETTE.emerald600
        : data.median_hours <= 24
          ? PALETTE.amber600
          : PALETTE.rose600

  const trendRows = (data?.trend ?? [])
    .filter((t) => t.median_hours != null)
    .map((t) => ({
      week: t.week.slice(5),
      median_hours: t.median_hours,
      count: t.count,
    }))

  const tooltipStyle = {
    background: PALETTE.stone50,
    border: `1px solid ${PALETTE.stone200}`,
    borderRadius: 6,
    fontSize: 12,
  }

  return (
    <ReportCard
      title="Approval turnaround time"
      caption={
        data && data.evaluated_count > 0
          ? `Median ${formatHours(data.median_hours)} · p90 ${formatHours(data.p90_hours)} · ${data.evaluated_count} orders evaluated · ${data.pending_count} pending approval now`
          : "Time between entering awaiting_approval and customer approval in the selected window."
      }
      help={{
        title: "Approval turnaround time",
        body: "How long orders sit in the 'awaiting_approval' stage before the customer approves. Measured from when the stage was entered to when the next stage transition occurred. Only orders that exited awaiting_approval within the selected date window are counted.",
        bullets: [
          "Median >24 hours means production time is being lost waiting on customers — every hour here is an hour later the job ships.",
          "p90 reveals the worst-case experience. If p90 is 3+ days, those customers received their order late through no fault of production.",
          "'Pending approval now' is immediately actionable: those orders are stuck right now. Consider a follow-up email or call if an order has been waiting more than 24 hours.",
          "Orders with rollback → re-submit cycles only count their first awaiting_approval pass in this report.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        !data || data.histogram.every((h) => h.count === 0)
          ? undefined
          : {
              filenameBase: "approval-turnaround",
              build: () =>
                buildCsv(
                  ["Wait time bucket", "Orders"],
                  data.histogram.map((h) => [h.bucket, h.count])
                ),
            }
      }
    >
      {isEmpty ? (
        <Text size="small" className="text-ui-fg-muted py-4 text-center block">
          No orders exited awaiting_approval in this window. Extend the date
          range or check that orders are progressing through stages.
        </Text>
      ) : (
        <>
          {/* KPI tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Median wait
              </Text>
              <Text
                className="text-3xl font-semibold tabular-nums leading-tight mt-0.5"
                style={{ color: medianColor }}
              >
                {formatHours(data?.median_hours ?? null)}
              </Text>
            </div>
            <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
              <Text size="xsmall" className="text-ui-fg-subtle">
                p90 wait
              </Text>
              <Text className="text-3xl font-semibold tabular-nums leading-tight mt-0.5">
                {formatHours(data?.p90_hours ?? null)}
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
                Pending approval now
              </Text>
              <Text
                className="text-2xl font-semibold tabular-nums leading-tight mt-0.5"
                style={{
                  color:
                    (data?.pending_count ?? 0) > 0
                      ? PALETTE.amber600
                      : undefined,
                }}
              >
                {data?.pending_count ?? 0}
              </Text>
            </div>
          </div>

          {/* Histogram + trend side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
            {/* Histogram */}
            <div>
              <Text size="small" className="font-medium block mb-1">
                Wait time distribution
              </Text>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.histogram ?? []}
                    margin={{ top: 4, right: 8, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid
                      stroke={PALETTE.stone200}
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="bucket"
                      tick={{ fontSize: 10, fill: PALETTE.slate500 }}
                      stroke={PALETTE.stone400}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: PALETTE.slate500 }}
                      stroke={PALETTE.stone400}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: any) => [`${value} orders`, "Count"]}
                    />
                    <Bar
                      dataKey="count"
                      fill={PALETTE.teal700}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly median trend */}
            {trendRows.length > 1 && (
              <div>
                <Text size="small" className="font-medium block mb-1">
                  Weekly median wait
                </Text>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendRows}
                      margin={{ top: 4, right: 8, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid
                        stroke={PALETTE.stone200}
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 10, fill: PALETTE.slate500 }}
                        stroke={PALETTE.stone400}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: PALETTE.slate500 }}
                        stroke={PALETTE.stone400}
                        tickFormatter={(v) => `${v}h`}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: any, _: string, item: any) => {
                          const row = item?.payload
                          return [
                            `${formatHours(value)} (${row?.count} orders)`,
                            "Median",
                          ]
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="median_hours"
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
          </div>
        </>
      )}
    </ReportCard>
  )
}
