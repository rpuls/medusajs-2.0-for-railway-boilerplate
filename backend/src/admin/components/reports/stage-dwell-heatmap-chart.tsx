import { useEffect, useState } from "react"
import { Text } from "@medusajs/ui"

import { ReportCard } from "./report-card"
import { buildCsv } from "../../lib/reports/csv"

const STAGE_LABELS: Record<string, string> = {
  received: "Received",
  art_review: "Art review",
  awaiting_approval: "Awaiting approval",
  approved: "Approved",
  blanks_ordered: "Blanks ordered",
  blanks_arrived: "Blanks received",
  in_production: "In production",
  quality_check: "QC",
  shipped: "Shipped",
  delivered: "Delivered",
}

type Health = "ok" | "warn" | "breach" | "none"

type WeekCell = {
  week: string
  count: number
  avg_days: number | null
  health: Health
}

type StageRow = {
  stage: string
  sla_days: number | null
  weeks: WeekCell[]
}

type Response = {
  from: string
  to: string
  weeks: string[]
  stages: StageRow[]
}

// Cell background by health
const HEALTH_BG: Record<Health, string> = {
  ok: "#dcfce7",      // green-100
  warn: "#fef9c3",    // yellow-100
  breach: "#fee2e2",  // red-100
  none: "#f1f5f9",    // slate-100
}

const HEALTH_TEXT: Record<Health, string> = {
  ok: "#166534",      // green-800
  warn: "#854d0e",    // yellow-800
  breach: "#991b1b",  // red-800
  none: "#94a3b8",    // slate-400
}

const LEGEND = [
  { health: "ok" as Health, label: "On track (≤ 80% of SLA)" },
  { health: "warn" as Health, label: "Approaching SLA" },
  { health: "breach" as Health, label: "Over SLA" },
  { health: "none" as Health, label: "No data / no SLA" },
]

// Abbreviate week label: "2024-01-08" → "Jan 8"
function weekLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00Z")
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

export const StageDwellHeatmapChart = ({
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
    fetch(`/admin/reports/stage-dwell-heatmap?${params.toString()}`, {
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

  const hasData =
    !loading &&
    !error &&
    data &&
    data.stages.some((s) => s.weeks.some((w) => w.count > 0))

  const isEmpty = !loading && !error && !hasData

  // Build CSV rows: stage + one column per week
  const buildCsvData = () => {
    if (!data) return null
    const header = ["Stage", ...data.weeks.map(weekLabel)]
    const rows = data.stages.map((s) => [
      STAGE_LABELS[s.stage] ?? s.stage,
      ...s.weeks.map((w) => (w.avg_days !== null ? `${w.avg_days}d (n=${w.count})` : "")),
    ])
    return buildCsv(header, rows)
  }

  return (
    <ReportCard
      title="Stage bottleneck heatmap"
      caption="Average dwell time per stage per week. Green = on track, amber = approaching SLA, red = over SLA. Cells show avg days (sample count on hover)."
      help={{
        title: "Stage bottleneck heatmap",
        body: "Each cell shows the average time orders spent at that stage before moving on, grouped by the week they exited. Colour encodes SLA health: green is on track, amber is approaching, red is over.",
        bullets: [
          "A whole column being red means that week had a systemic slowdown across all stages (e.g. short week, equipment issue).",
          "A whole row being red means a specific stage is chronically slow — address staffing or process for that stage.",
          "Cells with a low sample count (hover to see) are statistically noisy — don't over-index on isolated red cells.",
          "SLA thresholds come from STAGE_SLA_DAYS in production-stage.ts. Stages with no SLA show as grey.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        hasData
          ? {
              filenameBase: "stage-dwell-heatmap",
              build: buildCsvData,
            }
          : undefined
      }
    >
      {isEmpty ? (
        <Text size="small" className="text-ui-fg-muted py-4 text-center">
          No completed stage transitions in this window.
        </Text>
      ) : data ? (
        <div className="flex flex-col gap-y-3">
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {LEGEND.map(({ health, label }) => (
              <div key={health} className="flex items-center gap-x-1.5">
                <div
                  className="w-3 h-3 rounded-sm border border-black/10"
                  style={{ background: HEALTH_BG[health] }}
                />
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {label}
                </Text>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse w-full min-w-[480px]">
              <thead>
                <tr>
                  <th className="text-left py-1 pr-3 font-medium text-ui-fg-subtle whitespace-nowrap min-w-[130px]">
                    Stage
                  </th>
                  {data.weeks.map((w) => (
                    <th
                      key={w}
                      className="text-center py-1 px-1 font-medium text-ui-fg-subtle whitespace-nowrap min-w-[52px]"
                    >
                      {weekLabel(w)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.stages.map((s) => (
                  <tr key={s.stage}>
                    <td className="py-0.5 pr-3 font-medium text-ui-fg-base whitespace-nowrap">
                      {STAGE_LABELS[s.stage] ?? s.stage}
                      {s.sla_days !== null ? (
                        <span className="ml-1 text-ui-fg-muted font-normal">
                          ({s.sla_days}d SLA)
                        </span>
                      ) : null}
                    </td>
                    {s.weeks.map((cell) => (
                      <td
                        key={cell.week}
                        className="py-0.5 px-1 text-center rounded"
                        style={{
                          background: HEALTH_BG[cell.health],
                          color: HEALTH_TEXT[cell.health],
                        }}
                        title={
                          cell.avg_days !== null
                            ? `Avg ${cell.avg_days}d over ${cell.count} order${cell.count === 1 ? "" : "s"}`
                            : "No data"
                        }
                      >
                        {cell.avg_days !== null ? `${cell.avg_days}d` : "—"}
                      </td>
                    ))}
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
