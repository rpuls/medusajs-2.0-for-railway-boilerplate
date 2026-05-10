import { useEffect, useState } from "react"
import { Text } from "@medusajs/ui"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type BinRow = { bin_label: string; count: number }

type Response = {
  from: string
  to: string
  sample_size: number
  median_days: number
  p90_days: number
  benchmark_days: number
  histogram: BinRow[]
}

export const SupplierLeadTimeChart = ({
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
    fetch(`/admin/reports/supplier-lead-time?${params.toString()}`, {
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

  const rows = data?.histogram ?? []
  const isEmpty = !loading && !error && (data?.sample_size ?? 0) === 0

  const benchmarkLabel = data ? `Benchmark: ${data.benchmark_days}d` : ""

  return (
    <ReportCard
      title="Supplier lead time"
      caption={
        data && data.sample_size > 0
          ? `Blanks ordered → received. Median ${data.median_days}d · p90 ${data.p90_days}d · ${data.sample_size} orders · benchmark ${data.benchmark_days}d`
          : "Distribution of days between blanks_ordered and blanks_arrived stages."
      }
      help={{
        title: "Supplier lead time",
        body: "Time in days between when blanks were ordered from the supplier (blanks_ordered stage) and when they arrived (blanks_arrived stage). Only counts orders that completed this transition in the selected window.",
        bullets: [
          "Benchmark is 5 business days for AS Colour standard restocks. Express orders should be faster.",
          "A long right tail (p90 much higher than median) suggests a subset of SKUs or suppliers taking much longer.",
          "If the sample is small, extend the date range — only orders that received blanks in the window are counted.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        rows.length === 0
          ? undefined
          : {
              filenameBase: "supplier-lead-time",
              build: () =>
                buildCsv(
                  ["Days bucket", "Orders"],
                  rows.map((r) => [r.bin_label, r.count])
                ),
            }
      }
    >
      {isEmpty ? (
        <Text size="small" className="text-ui-fg-muted py-4 text-center">
          No completed blanks_ordered → blanks_arrived transitions in this window.
        </Text>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
              <XAxis
                dataKey="bin_label"
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
                formatter={(value: any) => [`${value} orders`, "Count"]}
              />
              {data && (
                <ReferenceLine
                  x={`${data.benchmark_days}d`}
                  stroke={PALETTE.amber600}
                  strokeDasharray="4 3"
                  label={{
                    value: benchmarkLabel,
                    position: "insideTopRight",
                    fontSize: 11,
                    fill: PALETTE.amber600,
                  }}
                />
              )}
              <Bar
                dataKey="count"
                fill={PALETTE.slate600}
                radius={[3, 3, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ReportCard>
  )
}
