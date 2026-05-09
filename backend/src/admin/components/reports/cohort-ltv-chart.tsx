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
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Cohort = {
  cohort_month: string
  cohort_size: number
  months_observed: number
  avg_ltv_to_date: number
  cumulative_avg_per_month: number[]
}

type Response = {
  cohorts: Cohort[]
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

// Slate → teal gradient so most-recent cohorts pop in teal, oldest fade to slate.
const cohortColor = (i: number, n: number): string => {
  if (n <= 1) return PALETTE.teal700
  const t = i / (n - 1)
  // Lerp between slate500 (older) and teal700 (newer); we use a small palette set
  const palette = [
    PALETTE.slate300,
    PALETTE.slate500,
    PALETTE.slate700,
    PALETTE.teal500,
    PALETTE.teal700,
  ]
  const idx = Math.round(t * (palette.length - 1))
  return palette[idx]
}

export const CohortLtvChart = ({
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
    const params = new URLSearchParams()
    if (regionId) params.set("region_id", regionId)
    fetch(
      `/admin/reports/cohort-ltv${params.toString() ? `?${params}` : ""}`,
      { credentials: "include" }
    )
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
  }, [regionId])

  const cohorts = data?.cohorts ?? []
  // Pivot to wide format for recharts: each row = month-since-acquisition, each cohort = a series.
  const maxMonths = cohorts.reduce(
    (m, c) => Math.max(m, c.cumulative_avg_per_month.length),
    0
  )
  const series: Array<Record<string, number | string>> = []
  for (let m = 0; m < maxMonths; m++) {
    const row: Record<string, number | string> = { month: `M${m}` }
    for (const c of cohorts) {
      const v = c.cumulative_avg_per_month[m]
      if (typeof v === "number") row[c.cohort_month] = v
    }
    series.push(row)
  }

  return (
    <ReportCard
      title="Cohort LTV curve"
      caption="Cumulative average revenue per customer, per acquisition cohort. Newer cohorts on top — if their early-month curves climb faster than older ones, your customer quality is improving."
      help="A cohort = customers whose first order fell in that month. The line shows their cumulative revenue per head, indexed to their acquisition month (M0). Compare M3-M6 across cohorts to see whether quality is trending up."
      loading={loading}
      error={error}
      loadedAt={loadedAt}
      csv={
        cohorts.length === 0
          ? undefined
          : {
              filenameBase: "cohort-ltv",
              build: () => {
                const headers = [
                  "Cohort",
                  "Cohort size",
                  "Months observed",
                  ...Array.from({ length: maxMonths }, (_, i) => `M${i}`),
                ]
                const rows = cohorts.map((c) => [
                  c.cohort_month,
                  c.cohort_size,
                  c.months_observed,
                  ...Array.from(
                    { length: maxMonths },
                    (_, i) => c.cumulative_avg_per_month[i] ?? ""
                  ),
                ])
                return buildCsv(headers, rows as any)
              },
            }
      }
    >
      {cohorts.length === 0 ? (
        <EmptyState
          title="No cohorts yet"
          body="Need at least one customer with a first order recorded before this chart can plot. Place a test order or wait for the next real one."
        />
      ) : (
        <>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={series}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: PALETTE.slate500 }}
                  stroke={PALETTE.stone400}
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
                  formatter={(value: any, name: any) => [
                    formatCurrency(Number(value)),
                    String(name),
                  ]}
                />
                {cohorts.map((c, i) => (
                  <Line
                    key={c.cohort_month}
                    type="monotone"
                    dataKey={c.cohort_month}
                    stroke={cohortColor(i, cohorts.length)}
                    strokeWidth={i === cohorts.length - 1 ? 2.5 : 1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Text size="xsmall" className="text-ui-fg-muted block mt-1">
            {cohorts.length} cohort{cohorts.length === 1 ? "" : "s"} ·{" "}
            most recent ({cohorts[cohorts.length - 1]?.cohort_month}):{" "}
            {cohorts[cohorts.length - 1]?.cohort_size} customers ·{" "}
            avg LTV to date{" "}
            {formatCurrency(cohorts[cohorts.length - 1]?.avg_ltv_to_date ?? 0)}
          </Text>
        </>
      )}
    </ReportCard>
  )
}
