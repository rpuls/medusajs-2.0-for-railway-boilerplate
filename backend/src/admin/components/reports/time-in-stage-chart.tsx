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
  delivered: "Delivered",
}

type StageRow = {
  stage: string
  sample_size: number
  median_days: number
  p90_days: number
}

type Response = {
  from: string
  to: string
  stages: StageRow[]
}

export const TimeInStageChart = ({
  fromIso,
  toIso,
  methodCsv,
  regionId,
}: {
  fromIso: string
  toIso: string
  methodCsv: string | null
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
    if (methodCsv) params.set("method", methodCsv)
    if (regionId) params.set("region_id", regionId)
    fetch(`/admin/reports/time-in-stage?${params.toString()}`, {
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
  }, [fromIso, toIso, methodCsv, regionId])

  const rows = (data?.stages ?? []).map((s) => ({
    stage: STAGE_LABELS[s.stage] ?? s.stage,
    stage_key: s.stage,
    median: s.median_days,
    p90: s.p90_days,
    samples: s.sample_size,
  }))

  const handleBarClick = (payload: any) => {
    const stageKey = payload?.stage_key
    if (typeof stageKey !== "string" || stageKey.length === 0) return
    window.location.href = `/app/production?stage=${encodeURIComponent(stageKey)}`
  }

  return (
    <ReportCard
      title="Time in stage"
      caption="Median (slate) and p90 (stone) dwell time per stage, in days. Excludes orders still at the stage. Wide gap between median and p90 means the stage is unreliable, not just slow."
      loading={loading}
      error={error}
      csv={
        rows.length === 0
          ? undefined
          : {
              filenameBase: "time-in-stage",
              build: () =>
                buildCsv(
                  ["Stage", "Sample size", "Median (days)", "p90 (days)"],
                  rows.map((r) => [r.stage, r.samples, r.median, r.p90])
                ),
            }
      }
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
          >
            <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: PALETTE.slate500 }}
              tickFormatter={(v) => `${v}d`}
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
              formatter={(value: any, name: string) => {
                if (name === "median") return [`${value}d`, "Median"]
                if (name === "p90") return [`${value}d`, "p90"]
                return [value, name]
              }}
              labelFormatter={(label, payload) => {
                const samples = (payload?.[0]?.payload as any)?.samples ?? 0
                return `${label} · ${samples} ${samples === 1 ? "sample" : "samples"}`
              }}
            />
            <Bar
              dataKey="median"
              fill={PALETTE.slate700}
              radius={[0, 2, 2, 0]}
              maxBarSize={18}
              cursor="pointer"
              onClick={handleBarClick}
            />
            <Bar
              dataKey="p90"
              fill={PALETTE.stone400}
              radius={[0, 2, 2, 0]}
              maxBarSize={18}
              cursor="pointer"
              onClick={handleBarClick}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ReportCard>
  )
}
