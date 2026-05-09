import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type CampaignRow = {
  campaign: string
  source: string
  sessions: number
  purchases: number
  revenue: number
  conversion_rate: number
  aov: number
}

type Response = {
  configured: boolean
  from: string
  to: string
  campaigns: CampaignRow[]
  totals: {
    sessions: number
    purchases: number
    revenue: number
    conversion_rate: number
    aov: number
  }
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

export const EmailChannelRoiChart = ({
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
    fetch(`/admin/reports/email-channel-roi?${params.toString()}`, {
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
      <ReportCard title="Email channel ROI">
        <Text size="small" className="text-ui-fg-subtle">
          GA4 isn't configured. Set{" "}
          <code className="font-mono text-xs">GOOGLE_SERVICE_ACCOUNT_JSON</code>{" "}
          and <code className="font-mono text-xs">GA4_PROPERTY_ID</code> on the
          backend.
        </Text>
      </ReportCard>
    )
  }

  const campaigns = data?.campaigns ?? []
  const maxRevenue = campaigns.reduce((m, c) => Math.max(m, c.revenue), 0)

  return (
    <ReportCard
      title="Email channel ROI"
      caption="GA4 sessions + revenue from email traffic, broken down by campaign UTM. Tells you which transactional / marketing emails actually earn vs which burn list goodwill. Reorder reminders + winbacks are the highest-leverage rows once they accumulate."
      help={{
        title: "Email channel ROI",
        body: "Revenue and sessions attributed to email traffic, grouped by campaign UTM. Tells you which campaigns earn back the time and goodwill they spend on the list — and which are net negative.",
        bullets: [
          "Reorder reminders and win-back emails are usually the highest revenue-per-send rows once they've been running long enough to accumulate; lean into those before launching new broadcasts.",
          "A high-session, low-revenue row is usually a content email — fine for retention, not for direct ROI tracking.",
          "If a campaign is missing here, the email links probably lack utm_source=email&utm_campaign=... — fix the template once and the data flows in.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        campaigns.length === 0
          ? undefined
          : {
              filenameBase: "email-channel-roi",
              build: () =>
                buildCsv(
                  [
                    "Campaign",
                    "Source",
                    "Sessions",
                    "Purchases",
                    "Revenue",
                    "Conversion rate",
                    "AOV",
                  ],
                  campaigns.map((c) => [
                    c.campaign,
                    c.source,
                    c.sessions,
                    c.purchases,
                    c.revenue,
                    (c.conversion_rate * 100).toFixed(2) + "%",
                    c.aov,
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Email sessions
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {(data?.totals.sessions ?? 0).toLocaleString("en-AU")}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Purchases
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {(data?.totals.purchases ?? 0).toLocaleString("en-AU")}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Revenue
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {formatCurrency(data?.totals.revenue ?? 0)}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Avg AOV
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {formatCurrency(data?.totals.aov ?? 0)}
          </Text>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted block mt-3">
          No GA4 sessions tagged with email-medium UTM in window. Once a
          customer clicks an email link the next day's report shows
          attribution here.
        </Text>
      ) : (
        <div className="flex flex-col gap-y-1.5 mt-3">
          {campaigns.map((c, i) => {
            const widthPct =
              maxRevenue > 0
                ? Math.max(4, Math.round((c.revenue / maxRevenue) * 100))
                : 0
            return (
              <div
                key={c.campaign + c.source + i}
                className="flex items-center gap-x-3"
              >
                <div className="w-44 shrink-0">
                  <Text
                    size="small"
                    className="font-mono text-xs truncate font-medium"
                  >
                    {c.campaign}
                  </Text>
                  <Text
                    size="xsmall"
                    className="font-mono text-xs text-ui-fg-muted truncate"
                  >
                    {c.source}
                  </Text>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-3 rounded bg-ui-bg-subtle overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${widthPct}%`,
                        background: PALETTE.teal700,
                      }}
                    />
                  </div>
                </div>
                <Text
                  size="small"
                  className="tabular-nums w-24 text-right font-medium"
                >
                  {formatCurrency(c.revenue)}
                </Text>
                <Text
                  size="xsmall"
                  className="tabular-nums w-20 text-right text-ui-fg-muted"
                  title={`${c.purchases} purchases · ${c.sessions} sessions`}
                >
                  {c.purchases}/{c.sessions}
                </Text>
                <Text
                  size="xsmall"
                  className="tabular-nums w-12 text-right text-ui-fg-muted"
                >
                  {(c.conversion_rate * 100).toFixed(1)}%
                </Text>
              </div>
            )
          })}
        </div>
      )}
    </ReportCard>
  )
}
