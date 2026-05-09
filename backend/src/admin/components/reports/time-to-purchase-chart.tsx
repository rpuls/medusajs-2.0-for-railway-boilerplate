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
import { buildCsv } from "../../lib/reports/csv"

type Histogram = Array<{ bucket_id: string; label: string; count: number }>

type Response = {
  from: string
  to: string
  first_purchase: {
    sample_size: number
    median_days: number
    histogram: Histogram
  }
  repeat_purchase: {
    sample_size: number
    median_days: number
    histogram: Histogram
  }
}

const Histo = ({
  data,
  color,
  emptyLabel,
}: {
  data: Histogram
  color: string
  emptyLabel: string
}) => {
  if (!data || data.every((d) => d.count === 0)) {
    return (
      <Text size="xsmall" className="text-ui-fg-muted">
        {emptyLabel}
      </Text>
    )
  }
  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
        >
          <CartesianGrid stroke={PALETTE.stone200} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: PALETTE.slate500 }}
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
          <Bar dataKey="count" fill={color} maxBarSize={48} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const TimeToPurchaseChart = ({
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
    fetch(`/admin/reports/time-to-purchase?${params.toString()}`, {
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

  return (
    <ReportCard
      title="Time to purchase"
      caption="How long signup-to-first-order takes (left) and how long first-to-second-order takes (right). Use these to size your email drip cadence and retargeting-ad windows."
      loading={loading}
      error={error}
      csv={
        !data
          ? undefined
          : {
              filenameBase: "time-to-purchase",
              build: () => {
                const rows: any[] = [
                  ["Stage", "Bucket", "Count"],
                  ...data.first_purchase.histogram.map((h) => [
                    "First purchase",
                    h.label,
                    h.count,
                  ]),
                  ...data.repeat_purchase.histogram.map((h) => [
                    "Repeat purchase",
                    h.label,
                    h.count,
                  ]),
                  [],
                  ["Stage", "Median days", "Sample size"],
                  [
                    "First purchase",
                    data.first_purchase.median_days,
                    data.first_purchase.sample_size,
                  ],
                  [
                    "Repeat purchase",
                    data.repeat_purchase.median_days,
                    data.repeat_purchase.sample_size,
                  ],
                ]
                return rows.map((r) => r.join(",")).join("\n")
              },
            }
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="flex flex-col gap-y-2">
          <div className="flex items-baseline justify-between">
            <Text size="small" className="font-semibold">
              Signup → first order
            </Text>
            <Text size="xsmall" className="text-ui-fg-muted">
              median {data?.first_purchase.median_days ?? 0}d ·{" "}
              {data?.first_purchase.sample_size ?? 0} customers
            </Text>
          </div>
          <Histo
            data={data?.first_purchase.histogram ?? []}
            color={PALETTE.slate700}
            emptyLabel="No new customers placed a first order in window."
          />
        </div>
        <div className="flex flex-col gap-y-2">
          <div className="flex items-baseline justify-between">
            <Text size="small" className="font-semibold">
              First order → second order
            </Text>
            <Text size="xsmall" className="text-ui-fg-muted">
              median {data?.repeat_purchase.median_days ?? 0}d ·{" "}
              {data?.repeat_purchase.sample_size ?? 0} customers
            </Text>
          </div>
          <Histo
            data={data?.repeat_purchase.histogram ?? []}
            color={PALETTE.teal700}
            emptyLabel="No customers placed their second order in window."
          />
        </div>
      </div>
    </ReportCard>
  )
}
