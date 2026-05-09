import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { EmptyState } from "./empty-state"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Response = {
  from: string
  to: string
  timezone: string
  summary: {
    total_orders: number
    peak_day: string | null
    peak_hour: number
    peak_count: number
  }
  matrix: number[][] // [day 0..6][hour 0..23]
  by_day: Array<{ day: string; orders: number }>
  by_hour: Array<{ hour: number; orders: number }>
}

const HOURS = Array.from({ length: 24 }, (_, h) => h)
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export const OrderTimeHeatmapChart = ({
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
  const [loadedAt, setLoadedAt] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    if (regionId) params.set("region_id", regionId)
    fetch(`/admin/reports/order-time-heatmap?${params.toString()}`, {
      credentials: "include",
    })
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
  }, [fromIso, toIso, regionId])

  // Determine cell color intensity by max value
  const max = (data?.matrix ?? []).reduce(
    (m, row) => Math.max(m, ...row),
    0
  )
  const cellColor = (n: number): string => {
    if (n === 0) return PALETTE.stone100
    if (max === 0) return PALETTE.stone100
    const t = n / max
    if (t > 0.8) return PALETTE.teal700
    if (t > 0.6) return PALETTE.teal500
    if (t > 0.4) return PALETTE.teal300
    if (t > 0.2) return "#a7f3d0"
    return "#d1fae5"
  }

  return (
    <ReportCard
      title="Order placement heatmap"
      caption="When customers actually place orders, by weekday and hour. Drives staffing decisions and best time to send marketing."
      help={{
        title: "Order placement heatmap",
        body: "When customers actually click 'Place order', by weekday and hour. Drives two decisions: when to staff for support coverage, and when to send marketing.",
        bullets: [
          "The single brightest cell is your peak hour — schedule a customer-service person online then, and time email sends to land 1–2 hours before.",
          "Lots of orders 9pm–midnight typically means hobby/team buyers placing orders after work; mornings skew more business/wholesale.",
          "Times are in Australia/Sydney (AEST/AEDT — daylight savings shift is absorbed into the histogram).",
        ],
      }}
      loading={loading}
      error={error}
      loadedAt={loadedAt}
      csv={
        !data
          ? undefined
          : {
              filenameBase: "order-time-heatmap",
              build: () => {
                const headers = [
                  "Day",
                  ...HOURS.map((h) => `${h}:00`),
                  "Total",
                ]
                const rows = data.matrix.map((row, d) => [
                  DAYS[d],
                  ...row,
                  row.reduce((s, n) => s + n, 0),
                ])
                return buildCsv(headers, rows as any)
              },
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Total orders
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.summary.total_orders ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Peak day
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.summary.peak_day ?? "—"}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Peak hour
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.summary.peak_hour != null && data.summary.peak_hour >= 0
              ? `${String(data.summary.peak_hour).padStart(2, "0")}:00`
              : "—"}
          </Text>
        </div>
      </div>

      {!data || data.summary.total_orders === 0 ? (
        <EmptyState
          title="No orders in window"
          body="Once orders start arriving, this will fill in as a heatmap of weekday × hour."
        />
      ) : (
        <div className="overflow-auto mt-4">
          <table
            className="border-collapse"
            style={{ minWidth: 24 * 24 + 56 }}
          >
            <thead>
              <tr>
                <th className="text-xs text-ui-fg-subtle text-right pr-2 font-normal w-12">
                  &nbsp;
                </th>
                {HOURS.map((h) => (
                  <th
                    key={h}
                    className="text-[10px] text-ui-fg-muted font-normal pb-1 text-center"
                    style={{ width: 24 }}
                  >
                    {h % 3 === 0 ? h : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.matrix.map((row, d) => (
                <tr key={d}>
                  <td className="text-xs text-ui-fg-subtle text-right pr-2 w-12">
                    {DAYS[d]}
                  </td>
                  {row.map((n, h) => (
                    <td
                      key={h}
                      title={`${DAYS[d]} ${String(h).padStart(2, "0")}:00 — ${n} order${n === 1 ? "" : "s"}`}
                      style={{
                        width: 24,
                        height: 24,
                        background: cellColor(n),
                        border: `1px solid ${PALETTE.stone100}`,
                      }}
                    >
                      <span className="sr-only">
                        {DAYS[d]} {h}:00: {n}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <Text size="xsmall" className="text-ui-fg-muted block mt-2">
            Times in {data.timezone}. Brighter = more orders. Hover any cell
            for the exact count.
          </Text>
        </div>
      )}
    </ReportCard>
  )
}
