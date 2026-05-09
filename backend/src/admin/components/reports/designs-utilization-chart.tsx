import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"

type Response = {
  from: string
  to: string
  summary: {
    designs_created: number
    designs_reused: number
    active_customers: number
    reuse_rate: number
  }
  top_customers_by_design_count: Array<{ customer_id: string; count: number }>
  module_available: boolean
}

const KpiTile = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-y-0.5 px-3 py-2 rounded-md bg-ui-bg-subtle/50">
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text className="text-2xl font-semibold tabular-nums">{value}</Text>
  </div>
)

export const DesignsUtilizationChart = ({
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
    fetch(`/admin/reports/designs-utilization?${params.toString()}`, {
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
  const reusePct = summary ? (summary.reuse_rate * 100).toFixed(1) : "0.0"

  return (
    <ReportCard
      title="My Designs feature utilization"
      caption="Designs the customer saved to their personal library. Reuse rate measures whether saved designs translate into repeat orders — Phase 2 success signal."
      loading={loading}
      error={error}
    >
      {data && !data.module_available ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          The designs module isn't registered on this backend.
        </Text>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiTile
            label="Designs created"
            value={String(summary?.designs_created ?? 0)}
          />
          <KpiTile
            label="Reused designs"
            value={String(summary?.designs_reused ?? 0)}
          />
          <KpiTile label="Reuse rate" value={`${reusePct}%`} />
          <KpiTile
            label="Active customers"
            value={String(summary?.active_customers ?? 0)}
          />
        </div>
      )}
    </ReportCard>
  )
}
