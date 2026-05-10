import { useEffect, useState } from "react"
import { Text } from "@medusajs/ui"
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

type ActorRow = {
  actor_id: string
  count: number
  stages: Record<string, number>
}

type Response = {
  from: string
  to: string
  actors: ActorRow[]
  total_transitions: number
}

export const StaffThroughputChart = ({
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
    fetch(`/admin/reports/staff-throughput?${params.toString()}`, {
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((j) => { if (!cancelled) setData(j as Response) })
      .catch((e) => { if (!cancelled) setError(e?.message ?? String(e)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [fromIso, toIso, regionId])

  const rows = (data?.actors ?? []).map((a) => ({
    actor: a.actor_id.length > 24 ? a.actor_id.slice(0, 22) + "…" : a.actor_id,
    actor_full: a.actor_id,
    count: a.count,
  }))

  const isEmpty = !loading && !error && rows.length === 0

  return (
    <ReportCard
      title="Staff throughput"
      caption="Number of production-stage transitions per staff member in the selected window. Requires stage changes to be made via the admin UI (records changed_by)."
      help={{
        title: "Staff throughput",
        body: "Counts how many times each staff member moved an order from one production stage to another. Each manual stage change via the admin order widget counts as one transition.",
        bullets: [
          "Only transitions recorded via the admin UI are counted — bulk imports or API calls without an auth actor won't appear.",
          "High counts may reflect genuine throughput or may indicate one person is doing all the stage updates (a process gap).",
          "Use alongside Time-in-Stage to see if high throughput correlates with faster stage exit or just more clicks.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        rows.length === 0
          ? undefined
          : {
              filenameBase: "staff-throughput",
              build: () =>
                buildCsv(
                  ["Staff member (actor_id)", "Transitions"],
                  rows.map((r) => [r.actor_full, r.count])
                ),
            }
      }
    >
      {isEmpty ? (
        <Text size="small" className="text-ui-fg-muted py-4 text-center">
          No stage transitions recorded in this window with a staff actor. Stage changes must be made via the admin UI.
        </Text>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: PALETTE.slate500 }}
                tickFormatter={(v) => `${v}`}
                stroke={PALETTE.stone400}
                allowDecimals={false}
              />
              <YAxis
                dataKey="actor"
                type="category"
                tick={{ fontSize: 11, fill: PALETTE.slate700 }}
                width={140}
                stroke={PALETTE.stone400}
              />
              <Tooltip
                contentStyle={{
                  background: PALETTE.stone50,
                  border: `1px solid ${PALETTE.stone200}`,
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(value: any) => [`${value} transitions`, "Count"]}
                labelFormatter={(label, payload) => {
                  const full = (payload?.[0]?.payload as any)?.actor_full ?? label
                  return full
                }}
              />
              <Bar
                dataKey="count"
                fill={PALETTE.teal700}
                radius={[0, 3, 3, 0]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ReportCard>
  )
}
