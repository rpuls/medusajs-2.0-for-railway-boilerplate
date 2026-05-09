import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type SourceRow = {
  source: string
  medium: string
  sessions: number
  engaged_sessions: number
  engagement_rate: number
}
type LandingRow = {
  path: string
  sessions: number
  engaged_sessions: number
  engagement_rate: number
}
type DeviceRow = {
  device: string
  sessions: number
  engaged_sessions: number
  bounce_rate: number
}
type Response = {
  configured: boolean
  from: string
  to: string
  totals: {
    sessions: number
    engaged_sessions: number
    bounce_rate: number
  }
  source_medium: SourceRow[]
  landing_pages: LandingRow[]
  devices: DeviceRow[]
  error?: string
  detail?: string
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

const DEVICE_COLORS: Record<string, string> = {
  desktop: PALETTE.slate700,
  mobile: PALETTE.teal700,
  tablet: PALETTE.amber600,
}

export const AcquisitionTab = ({
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
    fetch(`/admin/reports/ga4-acquisition?${params.toString()}`, {
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
      <ReportCard title="Acquisition (GA4)">
        <Text size="small" className="text-ui-fg-subtle">
          GA4 isn't configured on this backend yet. Set{" "}
          <code className="font-mono text-xs">GOOGLE_SERVICE_ACCOUNT_JSON</code>{" "}
          and <code className="font-mono text-xs">GA4_PROPERTY_ID</code> in the
          backend env to populate this tab. Once configured, traffic by
          source/medium, landing pages, and bounce rate by device will all
          appear here without further setup.
        </Text>
      </ReportCard>
    )
  }

  const totals = data?.totals
  const totalSessions = totals?.sessions ?? 0
  const engagementRate =
    totalSessions > 0 ? (totals!.engaged_sessions / totalSessions) * 100 : 0
  const bounceRatePct = (totals?.bounce_rate ?? 0) * 100

  return (
    <div className="grid grid-cols-1 gap-3">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <KpiTile label="Sessions" value={totalSessions.toLocaleString("en-AU")} />
        <KpiTile
          label="Engagement rate"
          value={`${engagementRate.toFixed(1)}%`}
        />
        <KpiTile
          label="Bounce rate"
          value={`${bounceRatePct.toFixed(1)}%`}
          color={bounceRatePct > 60 ? PALETTE.amber600 : undefined}
        />
      </div>

      {/* Source / medium */}
      <ReportCard
        title="Traffic by source / medium"
        caption="Where sessions come from. Engagement rate is sessions where the user actually interacted vs. just bounced. Channels with high sessions but low engagement are wasted spend."
        loading={loading}
        error={error}
        csv={
          !data || data.source_medium.length === 0
            ? undefined
            : {
                filenameBase: "ga4-source-medium",
                build: () =>
                  buildCsv(
                    [
                      "Source",
                      "Medium",
                      "Sessions",
                      "Engaged sessions",
                      "Engagement rate",
                    ],
                    data.source_medium.map((r) => [
                      r.source,
                      r.medium,
                      r.sessions,
                      r.engaged_sessions,
                      (r.engagement_rate * 100).toFixed(1) + "%",
                    ])
                  ),
              }
        }
      >
        {(data?.source_medium ?? []).length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            No GA4 sessions in window.
          </Text>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-ui-fg-subtle text-xs">
              <tr className="border-b border-ui-border-base">
                <th className="px-2 py-1 font-medium">Source</th>
                <th className="px-2 py-1 font-medium">Medium</th>
                <th className="px-2 py-1 font-medium text-right">Sessions</th>
                <th className="px-2 py-1 font-medium text-right">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {data?.source_medium.map((r, i) => (
                <tr
                  key={r.source + r.medium + i}
                  className="border-b border-ui-border-base"
                >
                  <td className="px-2 py-1 truncate font-mono text-xs">
                    {r.source}
                  </td>
                  <td className="px-2 py-1 truncate font-mono text-xs text-ui-fg-muted">
                    {r.medium}
                  </td>
                  <td className="px-2 py-1 text-right tabular-nums">
                    {r.sessions.toLocaleString("en-AU")}
                  </td>
                  <td className="px-2 py-1 text-right tabular-nums text-ui-fg-muted">
                    {(r.engagement_rate * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </ReportCard>

      {/* Landing pages */}
      <ReportCard
        title="Top landing pages"
        caption="Entry pages that started a session. Without ecommerce events (Tier C) we can't attribute revenue here yet — sessions only."
        loading={loading}
        error={error}
        csv={
          !data || data.landing_pages.length === 0
            ? undefined
            : {
                filenameBase: "ga4-landing-pages",
                build: () =>
                  buildCsv(
                    ["Rank", "Path", "Sessions", "Engaged sessions", "Engagement rate"],
                    data.landing_pages.map((r, i) => [
                      i + 1,
                      r.path,
                      r.sessions,
                      r.engaged_sessions,
                      (r.engagement_rate * 100).toFixed(1) + "%",
                    ])
                  ),
              }
        }
      >
        {(data?.landing_pages ?? []).length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            No GA4 landing-page data in window.
          </Text>
        ) : (
          <div className="flex flex-col gap-y-1">
            {data?.landing_pages.map((r, i) => {
              const max = data.landing_pages[0]?.sessions ?? 1
              const widthPct =
                max > 0 ? Math.max(4, Math.round((r.sessions / max) * 100)) : 0
              return (
                <div key={r.path + i} className="flex items-center gap-x-3">
                  <Text size="xsmall" className="w-6 text-ui-fg-muted tabular-nums">
                    {i + 1}.
                  </Text>
                  <div className="flex-1 min-w-0">
                    <Text size="small" className="truncate font-mono text-xs">
                      {r.path}
                    </Text>
                    <div className="h-2 mt-1 rounded bg-ui-bg-subtle overflow-hidden">
                      <div
                        className="h-full"
                        style={{ width: `${widthPct}%`, background: PALETTE.slate700 }}
                      />
                    </div>
                  </div>
                  <Text size="small" className="tabular-nums w-20 text-right font-medium">
                    {r.sessions.toLocaleString("en-AU")}
                  </Text>
                  <Text
                    size="xsmall"
                    className="tabular-nums w-16 text-right text-ui-fg-muted"
                  >
                    {(r.engagement_rate * 100).toFixed(1)}%
                  </Text>
                </div>
              )
            })}
          </div>
        )}
      </ReportCard>

      {/* Devices */}
      <ReportCard
        title="Bounce rate by device"
        caption="Mobile bounce >> desktop bounce is a flag — your responsive design or mobile loading speed needs attention. Vercel Speed Insights surfaces the actual culprit."
        loading={loading}
        error={error}
        csv={
          !data || data.devices.length === 0
            ? undefined
            : {
                filenameBase: "ga4-devices",
                build: () =>
                  buildCsv(
                    ["Device", "Sessions", "Engaged sessions", "Bounce rate"],
                    data.devices.map((r) => [
                      r.device,
                      r.sessions,
                      r.engaged_sessions,
                      (r.bounce_rate * 100).toFixed(1) + "%",
                    ])
                  ),
              }
        }
      >
        {(data?.devices ?? []).length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            No GA4 device data in window.
          </Text>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {data?.devices.map((r) => {
              const bouncePct = (r.bounce_rate * 100).toFixed(1)
              const bounceColor =
                r.bounce_rate > 0.6 ? PALETTE.amber600 : PALETTE.slate700
              return (
                <div
                  key={r.device}
                  className="flex flex-col gap-y-0.5 px-3 py-2 rounded-md bg-ui-bg-subtle/50"
                >
                  <div className="flex items-center gap-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{
                        background:
                          DEVICE_COLORS[r.device] ?? PALETTE.slate500,
                      }}
                    />
                    <Text size="small" className="capitalize font-medium">
                      {r.device}
                    </Text>
                  </div>
                  <Text className="text-2xl font-semibold tabular-nums">
                    {r.sessions.toLocaleString("en-AU")}
                  </Text>
                  <Text
                    size="xsmall"
                    style={{ color: bounceColor }}
                  >
                    {bouncePct}% bounce rate
                  </Text>
                </div>
              )
            })}
          </div>
        )}
      </ReportCard>
    </div>
  )
}
