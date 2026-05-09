import { Text, Tooltip } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import {
  DECORATION_METHOD_COLORS,
  DECORATION_METHOD_LABELS,
  type DecorationMethodKey,
} from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Segment = {
  method: DecorationMethodKey
  revenue: number
  units: number
  revenue_share: number
  unit_share: number
}

type Response = {
  from: string
  to: string
  currency: string
  total_revenue: number
  total_units: number
  segments: Segment[]
}

const formatCurrency = (n: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency.toUpperCase() || "AUD",
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `$${Math.round(n)}`
  }
}

/**
 * A single horizontal stacked bar with a row of legend entries below.
 * Reads more clearly than a 7-slice donut once you have ≥ 5 segments.
 */
const StackedBar = ({
  segments,
  shareKey,
  totalLabel,
  total,
  currency,
}: {
  segments: Segment[]
  shareKey: "revenue_share" | "unit_share"
  totalLabel: string
  total: string
  currency: string
}) => {
  // Filter out zero-share segments so the bar stays clean.
  const visible = segments.filter((s) => s[shareKey] > 0)
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-baseline justify-between">
        <Text size="xsmall" className="text-ui-fg-subtle">
          {totalLabel}
        </Text>
        <Text size="small" className="font-semibold tabular-nums">
          {total}
        </Text>
      </div>
      <div className="h-8 w-full rounded overflow-hidden flex border border-ui-border-base">
        {visible.length === 0 ? (
          <div className="flex-1 bg-ui-bg-subtle flex items-center justify-center">
            <Text size="xsmall" className="text-ui-fg-muted">
              No data in period
            </Text>
          </div>
        ) : (
          visible.map((s) => (
            <Tooltip
              key={s.method}
              content={
                shareKey === "revenue_share"
                  ? `${DECORATION_METHOD_LABELS[s.method]} · ${formatCurrency(s.revenue, currency)} (${(s[shareKey] * 100).toFixed(1)}%)`
                  : `${DECORATION_METHOD_LABELS[s.method]} · ${s.units} units (${(s[shareKey] * 100).toFixed(1)}%)`
              }
            >
              <div
                style={{
                  background: DECORATION_METHOD_COLORS[s.method],
                  width: `${s[shareKey] * 100}%`,
                  minWidth: "2px",
                }}
              />
            </Tooltip>
          ))
        )}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {segments.map((s) => (
          <div key={s.method} className="flex items-center gap-x-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: DECORATION_METHOD_COLORS[s.method] }}
            />
            <Text size="xsmall" className="text-ui-fg-subtle">
              {DECORATION_METHOD_LABELS[s.method]}{" "}
              <span className="text-ui-fg-base font-medium tabular-nums">
                {(s[shareKey] * 100).toFixed(1)}%
              </span>
            </Text>
          </div>
        ))}
      </div>
    </div>
  )
}

export const DecorationMixChart = ({
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
    fetch(`/admin/reports/decoration-mix?${params.toString()}`, {
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

  const segments = data?.segments ?? []
  const currency = data?.currency ?? "aud"

  return (
    <ReportCard
      title="Decoration mix"
      caption="Revenue and unit-volume share by method. Compare side-by-side: a method that's a small revenue slice but a big unit slice is your low-margin bulk work; the inverse is your premium offering."
      loading={loading}
      error={error}
      csv={
        segments.length === 0
          ? undefined
          : {
              filenameBase: "decoration-mix",
              build: () =>
                buildCsv(
                  ["Method", "Revenue", "Revenue share %", "Units", "Unit share %"],
                  segments.map((s) => [
                    DECORATION_METHOD_LABELS[s.method],
                    s.revenue,
                    (s.revenue_share * 100).toFixed(1),
                    s.units,
                    (s.unit_share * 100).toFixed(1),
                  ])
                ),
            }
      }
    >
      <div className="flex flex-col gap-y-5">
        <StackedBar
          segments={segments}
          shareKey="revenue_share"
          totalLabel="Revenue"
          total={data ? formatCurrency(data.total_revenue, currency) : "—"}
          currency={currency}
        />
        <StackedBar
          segments={segments}
          shareKey="unit_share"
          totalLabel="Units decorated"
          total={data ? data.total_units.toLocaleString("en-AU") : "—"}
          currency={currency}
        />
      </div>
    </ReportCard>
  )
}
