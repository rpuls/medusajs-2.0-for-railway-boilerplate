import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Response = {
  from: string
  to: string
  currency: string
  summary: {
    total_carts: number
    completed_carts: number
    active_carts: number
    abandoned_carts: number
    conversion_rate: number
    abandonment_rate: number
    median_completed_value: number
    median_abandoned_value: number
  }
  data_available: boolean
  error?: string
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

export const CartConversionChart = ({
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
    fetch(`/admin/reports/cart-conversion?${params.toString()}`, {
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
  const currency = data?.currency ?? "aud"
  const conversionPct = summary
    ? (summary.conversion_rate * 100).toFixed(1)
    : "0.0"
  const abandonmentPct = summary
    ? (summary.abandonment_rate * 100).toFixed(1)
    : "0.0"

  // Compute the funnel-style horizontal segments.
  const total = summary?.total_carts ?? 0
  const completedShare = total > 0 ? (summary?.completed_carts ?? 0) / total : 0
  const activeShare = total > 0 ? (summary?.active_carts ?? 0) / total : 0
  const abandonedShare = total > 0 ? (summary?.abandoned_carts ?? 0) / total : 0

  return (
    <ReportCard
      title="Cart-to-order conversion"
      caption="Bottom slice of the funnel from Medusa data alone — what % of carts created in the window became orders. Pre-cart drop-off (sessions, PDP views) needs Tier C event tracking."
      help={{
        title: "Cart-to-order conversion",
        body: "The narrowest part of the conversion funnel: of every cart customers built in the window, how many actually became paid orders. Pre-cart steps (page views, add-to-cart) live in PDP conversion or the GA4 funnel chart.",
        bullets: [
          "Healthy stores see 35–55% — anything below 25% usually means checkout friction (shipping shock, payment failure, login wall).",
          "If the median abandoned cart is bigger than the median completed cart, customers are getting cost shock at the shipping step — review thresholds and copy.",
          "Active carts (not yet abandoned, not yet checked out) are excluded from both rates — they'll resolve in the next window.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        !data?.data_available
          ? undefined
          : {
              filenameBase: "cart-conversion",
              build: () =>
                buildCsv(
                  ["Metric", "Value"],
                  [
                    ["Total carts", summary?.total_carts ?? 0],
                    ["Completed carts", summary?.completed_carts ?? 0],
                    ["Active carts", summary?.active_carts ?? 0],
                    ["Abandoned carts", summary?.abandoned_carts ?? 0],
                    ["Conversion rate %", conversionPct],
                    ["Abandonment rate %", abandonmentPct],
                    ["Median completed cart value", summary?.median_completed_value ?? 0],
                    ["Median abandoned cart value", summary?.median_abandoned_value ?? 0],
                  ]
                ),
            }
      }
    >
      {!data?.data_available ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          Cart data isn't graphable right now.
        </Text>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile
          label="Conversion rate"
          value={`${conversionPct}%`}
          color={PALETTE.emerald600}
        />
        <KpiTile
          label="Abandonment rate"
          value={`${abandonmentPct}%`}
          color={PALETTE.rose600}
        />
        <KpiTile
          label="Median completed cart"
          value={formatCurrency(summary?.median_completed_value ?? 0, currency)}
        />
        <KpiTile
          label="Median abandoned cart"
          value={formatCurrency(summary?.median_abandoned_value ?? 0, currency)}
          color={
            summary &&
            summary.median_abandoned_value > summary.median_completed_value
              ? PALETTE.amber600
              : undefined
          }
        />
      </div>

      <div className="flex flex-col gap-y-1 mt-2">
        <Text size="xsmall" className="text-ui-fg-subtle">
          {total} carts in window · {summary?.completed_carts ?? 0} completed ·{" "}
          {summary?.active_carts ?? 0} still active · {summary?.abandoned_carts ?? 0}{" "}
          abandoned
        </Text>
        <div className="h-6 w-full rounded overflow-hidden flex border border-ui-border-base">
          <div
            style={{
              background: PALETTE.emerald600,
              width: `${completedShare * 100}%`,
            }}
            title={`Completed: ${conversionPct}%`}
          />
          <div
            style={{
              background: PALETTE.amber600,
              width: `${activeShare * 100}%`,
            }}
            title={`Active: ${(activeShare * 100).toFixed(1)}%`}
          />
          <div
            style={{
              background: PALETTE.rose600,
              width: `${abandonedShare * 100}%`,
            }}
            title={`Abandoned: ${abandonmentPct}%`}
          />
        </div>
        {summary &&
        summary.median_abandoned_value > summary.median_completed_value ? (
          <Text
            size="xsmall"
            style={{ color: PALETTE.amber600 }}
            className="mt-1"
          >
            Abandoned carts are bigger on average — usually a checkout-cost
            shock (shipping or surcharges) rather than commitment doubt.
          </Text>
        ) : null}
      </div>
    </ReportCard>
  )
}
