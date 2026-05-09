import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"

type Response = {
  from: string
  to: string
  series: Array<{
    week_start: string
    customized: number
    blank: number
  }>
  summary: {
    total_orders: number
    customized_orders: number
    adoption_rate: number
    prior_total_orders: number
    prior_customized_orders: number
    prior_adoption_rate: number
    delta_pct_points: number
  }
}

const KpiTile = ({
  label,
  value,
  delta,
}: {
  label: string
  value: string
  delta?: { pp: number; positive: boolean } | null
}) => {
  return (
    <div className="flex flex-col gap-y-0.5 px-3 py-2 rounded-md bg-ui-bg-subtle/50">
      <Text size="xsmall" className="text-ui-fg-subtle">
        {label}
      </Text>
      <div className="flex items-baseline gap-x-2">
        <Text className="text-2xl font-semibold tabular-nums">{value}</Text>
        {delta ? (
          <Text
            size="xsmall"
            style={{
              color: delta.positive ? PALETTE.emerald600 : PALETTE.rose600,
            }}
          >
            {delta.pp > 0 ? "+" : ""}
            {delta.pp.toFixed(1)}pp vs prior
          </Text>
        ) : null}
      </div>
    </div>
  )
}

export const CustomizerAdoptionChart = ({
  fromIso,
  toIso,
}: {
  fromIso: string
  toIso: string
}) => {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    fetch(`/admin/reports/customizer-adoption?${params.toString()}`, {
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
  }, [fromIso, toIso])

  const summary = data?.summary
  const adoptionPct =
    summary && summary.total_orders > 0
      ? Math.round(summary.adoption_rate * 1000) / 10
      : 0
  const delta = summary
    ? {
        pp: summary.delta_pct_points,
        positive: summary.delta_pct_points >= 0,
      }
    : null

  return (
    <ReportCard
      title="Customizer adoption"
      caption="Share of orders that include at least one customised line. Trend up = the customizer is paying off; flat or declining = check drop-off."
      loading={loading}
      error={error}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <KpiTile
          label="Adoption (period)"
          value={`${adoptionPct.toFixed(1)}%`}
          delta={summary && summary.prior_total_orders > 0 ? delta : null}
        />
        <KpiTile
          label="Customised orders"
          value={String(summary?.customized_orders ?? 0)}
        />
        <KpiTile
          label="Total orders"
          value={String(summary?.total_orders ?? 0)}
        />
      </div>
      <div className="h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data?.series ?? []}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          >
            <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
            <XAxis
              dataKey="week_start"
              tick={{ fontSize: 10, fill: PALETTE.slate500 }}
              stroke={PALETTE.stone400}
              tickFormatter={(v: string) => v.slice(5)} // show MM-DD
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
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              iconType="square"
            />
            <Bar
              dataKey="customized"
              stackId="a"
              fill={PALETTE.slate700}
              name="Customised"
              maxBarSize={28}
            />
            <Bar
              dataKey="blank"
              stackId="a"
              fill={PALETTE.stone300}
              name="Blank"
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ReportCard>
  )
}
