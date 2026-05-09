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

type Response = {
  from: string
  to: string
  summary: {
    sent: number
    failed: number
    pending: number
    failure_rate: number
    median_lead_time_days: number
    average_lead_time_days: number
    sample_size: number
    oldest_pending: { order_id: string; display_id: any; days: number } | null
  }
  histogram: Array<{ bucket: string; count: number }>
}

const KpiTile = ({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) => (
  <div className="flex flex-col gap-y-0.5 px-3 py-2 rounded-md bg-ui-bg-subtle/50">
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text
      className="text-2xl font-semibold tabular-nums"
      style={color ? { color } : undefined}
    >
      {value}
    </Text>
  </div>
)

export const AsColourThroughputChart = ({
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
    fetch(`/admin/reports/ascolour-throughput?${params.toString()}`, {
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
  const failurePct = summary ? (summary.failure_rate * 100).toFixed(1) : "0.0"
  const failureColor =
    summary && summary.failure_rate > 0.05 ? PALETTE.rose600 : PALETTE.emerald600

  return (
    <ReportCard
      title="AS Colour throughput"
      caption="Lead time = days between blanks_ordered and blanks_arrived stage transitions. Failure rate = orders with ascolour_status='failed'. Spike in p90 lead time means AS Colour is unreliable, not just slow."
      loading={loading}
      error={error}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile label="Orders sent" value={String(summary?.sent ?? 0)} />
        <KpiTile
          label="Median lead time"
          value={`${summary?.median_lead_time_days ?? 0}d`}
        />
        <KpiTile
          label="Failure rate"
          value={`${failurePct}%`}
          color={failureColor}
        />
        <KpiTile label="Pending" value={String(summary?.pending ?? 0)} />
      </div>
      {summary?.oldest_pending ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          Oldest pending order: <span className="font-mono">#{summary.oldest_pending.display_id ?? summary.oldest_pending.order_id.slice(-6)}</span> — {summary.oldest_pending.days} days waiting on blanks.
        </Text>
      ) : null}
      <div className="h-48 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data?.histogram ?? []}
            margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
          >
            <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
            <XAxis
              dataKey="bucket"
              tick={{ fontSize: 11, fill: PALETTE.slate500 }}
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
              dataKey="count"
              fill={PALETTE.teal700}
              maxBarSize={48}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {summary && summary.sample_size === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          No completed AS Colour lead-time samples in period yet.
        </Text>
      ) : null}
    </ReportCard>
  )
}
