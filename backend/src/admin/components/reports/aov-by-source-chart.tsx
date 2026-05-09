import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type ChannelRow = {
  source: string
  medium: string
  sessions: number
  purchases: number
  revenue: number
  aov: number
  conversion_rate: number
  aov_delta_pct: number | null
}

type Response = {
  configured: boolean
  from: string
  to: string
  channels: ChannelRow[]
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

const formatDelta = (d: number | null): string => {
  if (d === null) return "—"
  const sign = d > 0 ? "+" : ""
  return `${sign}${d.toFixed(1)}%`
}

const deltaColor = (d: number | null): string => {
  if (d === null) return PALETTE.stone400
  if (d > 5) return PALETTE.emerald600
  if (d < -5) return PALETTE.rose600
  return PALETTE.stone400
}

export const AovBySourceChart = ({
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
    fetch(`/admin/reports/ga4-aov-by-source?${params.toString()}`, {
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
      <ReportCard title="AOV by traffic source">
        <Text size="small" className="text-ui-fg-subtle">
          GA4 isn't configured. Set{" "}
          <code className="font-mono text-xs">GOOGLE_SERVICE_ACCOUNT_JSON</code>{" "}
          and <code className="font-mono text-xs">GA4_PROPERTY_ID</code> in the
          backend env.
        </Text>
      </ReportCard>
    )
  }

  // Channels with non-zero purchases drive the visual; zero-purchase rows
  // are still in the table but get sunk visually.
  const withSales = (data?.channels ?? []).filter((c) => c.purchases > 0)
  const maxAov = withSales.reduce((m, c) => Math.max(m, c.aov), 0)

  return (
    <ReportCard
      title="AOV by traffic source"
      caption="Average order value per source / medium, with prior-period delta. High-AOV channels with rising deltas are where ad spend pays back fastest. Channels without purchases in window are excluded from the bar but listed in the CSV."
      help={{
        title: "AOV by traffic source",
        body: "Average order value broken down by GA4 source/medium, with the change vs the prior equal window. The mix tells you which channel pulls higher-spend buyers — that's where extra ad budget goes furthest.",
        bullets: [
          "High AOV + positive delta = scaling sweet-spot. Each extra session there is worth more than a session from a low-AOV channel.",
          "Low AOV but high session volume = a 'top of funnel' channel; useful for awareness, costly for direct ROI.",
          "Channels with zero purchases in the window are hidden from the chart but listed in the CSV — sometimes those are leaking sessions to a closer-attributed channel.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        !data || data.channels.length === 0
          ? undefined
          : {
              filenameBase: "aov-by-source",
              build: () =>
                buildCsv(
                  [
                    "Source",
                    "Medium",
                    "Sessions",
                    "Purchases",
                    "Revenue",
                    "AOV",
                    "Conversion rate",
                    "AOV Δ vs prior",
                  ],
                  data.channels.map((c) => [
                    c.source,
                    c.medium,
                    c.sessions,
                    c.purchases,
                    c.revenue,
                    c.aov,
                    (c.conversion_rate * 100).toFixed(2) + "%",
                    c.aov_delta_pct === null
                      ? ""
                      : c.aov_delta_pct.toFixed(1) + "%",
                  ])
                ),
            }
      }
    >
      {withSales.length === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          No GA4 ecommerce purchases in window. Once Tier C events
          accumulate (24-48h after first storefront deploy), AOV per
          channel populates here.
        </Text>
      ) : (
        <div className="flex flex-col gap-y-1.5">
          {withSales.map((c, i) => {
            const widthPct =
              maxAov > 0 ? Math.max(4, Math.round((c.aov / maxAov) * 100)) : 0
            return (
              <div
                key={c.source + c.medium + i}
                className="flex items-center gap-x-3"
              >
                <div className="w-44 shrink-0">
                  <Text
                    size="small"
                    className="font-mono text-xs truncate font-medium"
                  >
                    {c.source}
                  </Text>
                  <Text size="xsmall" className="font-mono text-xs text-ui-fg-muted truncate">
                    {c.medium}
                  </Text>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-3 rounded bg-ui-bg-subtle overflow-hidden">
                    <div
                      className="h-full"
                      style={{ width: `${widthPct}%`, background: PALETTE.teal700 }}
                    />
                  </div>
                </div>
                <Text size="small" className="tabular-nums w-20 text-right font-medium">
                  {formatCurrency(c.aov)}
                </Text>
                <Text
                  size="xsmall"
                  className="tabular-nums w-16 text-right"
                  style={{ color: deltaColor(c.aov_delta_pct) }}
                >
                  {formatDelta(c.aov_delta_pct)}
                </Text>
                <Text
                  size="xsmall"
                  className="tabular-nums w-16 text-right text-ui-fg-muted"
                  title={`${c.purchases} purchases · ${formatCurrency(c.revenue)} revenue`}
                >
                  {c.purchases}×
                </Text>
              </div>
            )
          })}
        </div>
      )}
    </ReportCard>
  )
}
