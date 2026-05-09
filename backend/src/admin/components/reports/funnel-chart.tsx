import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type FunnelStep = { name: string; count: number }
type ChannelRow = {
  source: string
  medium: string
  sessions: number
  add_to_carts: number
  begin_checkouts: number
  purchases: number
  revenue: number
  conversion_rate: number
}
type Response = {
  configured: boolean
  from: string
  to: string
  funnel: FunnelStep[]
  channels: ChannelRow[]
  totals: {
    sessions: number
    purchases: number
    revenue: number
    conversion_rate: number
  }
  error?: string
}

const formatCurrency = (n: number) => {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `$${Math.round(n)}`
  }
}

const KpiTile = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-y-0.5 px-3 py-2 rounded-md bg-ui-bg-subtle/50">
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text className="text-2xl font-semibold tabular-nums">{value}</Text>
  </div>
)

const FunnelStepRow = ({
  step,
  index,
  prevCount,
  maxCount,
}: {
  step: FunnelStep
  index: number
  prevCount: number | null
  maxCount: number
}) => {
  const widthPct = maxCount > 0 ? Math.max(2, (step.count / maxCount) * 100) : 0
  const dropoffPct =
    prevCount != null && prevCount > 0
      ? ((prevCount - step.count) / prevCount) * 100
      : 0
  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex items-center justify-between">
        <Text size="small" className="font-medium">
          {index + 1}. {step.name}
        </Text>
        <Text size="small" className="tabular-nums font-semibold">
          {step.count.toLocaleString("en-AU")}
        </Text>
      </div>
      <div className="h-6 rounded bg-ui-bg-subtle overflow-hidden">
        <div
          className="h-full"
          style={{ width: `${widthPct}%`, background: PALETTE.teal700 }}
        />
      </div>
      {prevCount != null && dropoffPct > 0 ? (
        <Text
          size="xsmall"
          style={{ color: dropoffPct > 50 ? PALETTE.amber600 : PALETTE.stone400 }}
        >
          −{dropoffPct.toFixed(1)}% drop-off from previous step
        </Text>
      ) : null}
    </div>
  )
}

export const FunnelChart = ({
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
    fetch(`/admin/reports/ga4-ecommerce?${params.toString()}`, {
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

  if (data && !data.configured) {
    return (
      <ReportCard title="E-commerce funnel">
        <Text size="small" className="text-ui-fg-subtle">
          GA4 isn't configured — can't build the funnel until events are
          flowing.
        </Text>
      </ReportCard>
    )
  }

  const funnel = data?.funnel ?? []
  const maxCount = Math.max(1, ...funnel.map((s) => s.count))
  const allZero = funnel.every((s) => s.count === 0)
  const channels = data?.channels ?? []
  const totals = data?.totals
  const conversionPct = totals
    ? (totals.conversion_rate * 100).toFixed(2)
    : "0.00"

  return (
    <div className="grid grid-cols-1 gap-3">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiTile
          label="Sessions"
          value={(totals?.sessions ?? 0).toLocaleString("en-AU")}
        />
        <KpiTile
          label="Purchases"
          value={(totals?.purchases ?? 0).toLocaleString("en-AU")}
        />
        <KpiTile
          label="Revenue (GA4)"
          value={formatCurrency(totals?.revenue ?? 0)}
        />
        <KpiTile label="Conversion rate" value={`${conversionPct}%`} />
      </div>

      {/* Funnel */}
      <ReportCard
        title="E-commerce funnel"
        caption="Session → product view → cart add → checkout → purchase. Big drop-off between two adjacent steps tells you where to focus UX work."
        loading={loading}
        error={error}
        csv={
          allZero
            ? undefined
            : {
                filenameBase: "ecommerce-funnel",
                build: () =>
                  buildCsv(
                    ["Step", "Count"],
                    funnel.map((s) => [s.name, s.count])
                  ),
              }
        }
      >
        {allZero ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            No funnel events yet — GA4 needs 24-48h after a fresh deploy
            before Enhanced Ecommerce events accumulate. If it's been
            longer than that, verify NEXT_PUBLIC_GA_MEASUREMENT_ID is
            set on the storefront.
          </Text>
        ) : (
          <div className="flex flex-col gap-y-3">
            {funnel.map((step, i) => (
              <FunnelStepRow
                key={step.name}
                step={step}
                index={i}
                prevCount={i > 0 ? funnel[i - 1].count : null}
                maxCount={maxCount}
              />
            ))}
          </div>
        )}
      </ReportCard>

      {/* Conversion by channel */}
      <ReportCard
        title="Conversion rate by channel"
        caption="Source/medium ranked by sessions, with the funnel collapsed into a single conversion %. Channels with high sessions but low conversion are wasted spend; the inverse is your sweet spot to scale."
        loading={loading}
        error={error}
        csv={
          channels.length === 0
            ? undefined
            : {
                filenameBase: "conversion-by-channel",
                build: () =>
                  buildCsv(
                    [
                      "Source",
                      "Medium",
                      "Sessions",
                      "Add-to-carts",
                      "Checkouts",
                      "Purchases",
                      "Revenue",
                      "Conversion rate %",
                    ],
                    channels.map((c) => [
                      c.source,
                      c.medium,
                      c.sessions,
                      c.add_to_carts,
                      c.begin_checkouts,
                      c.purchases,
                      c.revenue,
                      (c.conversion_rate * 100).toFixed(2),
                    ])
                  ),
              }
        }
      >
        {channels.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            No channel data yet.
          </Text>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-ui-fg-subtle text-xs">
              <tr className="border-b border-ui-border-base">
                <th className="px-2 py-1 font-medium">Source / medium</th>
                <th className="px-2 py-1 font-medium text-right">Sessions</th>
                <th className="px-2 py-1 font-medium text-right">Cart</th>
                <th className="px-2 py-1 font-medium text-right">Checkout</th>
                <th className="px-2 py-1 font-medium text-right">Purchase</th>
                <th className="px-2 py-1 font-medium text-right">CR%</th>
                <th className="px-2 py-1 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c, i) => {
                const crPct = (c.conversion_rate * 100).toFixed(2)
                const crColor =
                  c.conversion_rate >= 0.02
                    ? PALETTE.emerald600
                    : c.conversion_rate > 0
                      ? PALETTE.slate700
                      : PALETTE.rose600
                return (
                  <tr
                    key={c.source + c.medium + i}
                    className="border-b border-ui-border-base"
                  >
                    <td className="px-2 py-1">
                      <Text size="small" className="font-mono text-xs truncate">
                        {c.source} / {c.medium}
                      </Text>
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {c.sessions.toLocaleString("en-AU")}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums text-ui-fg-muted">
                      {c.add_to_carts.toLocaleString("en-AU")}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums text-ui-fg-muted">
                      {c.begin_checkouts.toLocaleString("en-AU")}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {c.purchases.toLocaleString("en-AU")}
                    </td>
                    <td
                      className="px-2 py-1 text-right tabular-nums font-medium"
                      style={{ color: crColor }}
                    >
                      {crPct}%
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {formatCurrency(c.revenue)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </ReportCard>
    </div>
  )
}
