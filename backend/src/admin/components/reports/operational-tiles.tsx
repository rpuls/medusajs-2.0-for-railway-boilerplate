import { Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { PALETTE } from "../../lib/reports/palette"
import { HelpTooltip } from "./help-tooltip"

type StorageResponse = {
  configured: boolean
  bucket: string | null
  total_bytes: number
  object_count: number
  capped: boolean
  prefixes?: Array<{ prefix: string; bytes: number; count: number }>
  error?: string
}

type PostHogResponse = {
  configured: boolean
  pageviews: number
  sessions: number
  topPath: string | null
  topPathViews: number
  windowDays: number
  error?: string
}

const formatCount = (n: number): string => n.toLocaleString("en-AU")

const formatBytes = (n: number): string => {
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}

/**
 * Compact strip of "operational health" tiles that doesn't need the full
 * report-card treatment: MinIO storage size, Vercel Speed Insights deep
 * link, and live PostHog traffic numbers. All three are external-data
 * signals where the original dashboard is better than re-implementing it.
 *
 * The Speed Insights link is fetched from /admin/reports/config so the
 * URL doesn't have to be inlined into the admin bundle at build time
 * (admin frontend can't read backend env vars without a NEXT_PUBLIC_
 * prefix and a build-time injection).
 */
type ConfigResponse = {
  vercel_speed_insights_url: string | null
}

export const OperationalTiles = () => {
  const [storage, setStorage] = useState<StorageResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [posthog, setPosthog] = useState<PostHogResponse | null>(null)
  const [posthogLoading, setPosthogLoading] = useState(false)
  const [speedInsightsUrl, setSpeedInsightsUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/admin/reports/storage`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { configured: false }))
      .then((j) => {
        if (!cancelled) setStorage(j as StorageResponse)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setPosthogLoading(true)
    fetch(`/admin/reports/posthog-stats`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { configured: false }))
      .then((j) => {
        if (!cancelled) setPosthog(j as PostHogResponse)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPosthogLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch(`/admin/reports/config`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { vercel_speed_insights_url: null }))
      .then((j) => {
        if (!cancelled) {
          setSpeedInsightsUrl((j as ConfigResponse).vercel_speed_insights_url)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Container className="flex flex-col gap-y-2 p-4">
      <Heading level="h2" className="text-base font-semibold flex items-center">
        Operational tiles
        <HelpTooltip
          text={{
            title: "Operational tiles",
            body: "Quick-link tiles to external systems whose own dashboards are richer than anything we'd re-build here. Each tile shows a one-glance signal and a click-through to the real tool.",
            bullets: [
              "Object storage = MinIO bucket size + object count. Watch the trend; rising fast usually means customizer artifacts aren't being garbage-collected.",
              "Speed Insights links to the Vercel Web Vitals dashboard for the storefront. Use it when bounce rates spike — it's the fastest way to see if a perf regression is the cause.",
              "PostHog links to your event analytics. Useful for replays and funnel analysis that GA4 can't do.",
              "Tiles render placeholder copy when their env vars aren't set — see the env vars table in CLAUDE.md.",
            ],
          }}
        />
      </Heading>
      <Text size="xsmall" className="text-ui-fg-subtle mb-2">
        External-data signals. Click through for the full dashboard.
      </Text>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* MinIO storage */}
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Object storage{storage?.bucket ? ` · ${storage.bucket}` : ""}
          </Text>
          {!storage?.configured ? (
            <Text size="small" className="text-ui-fg-muted">
              MinIO env vars not set.
            </Text>
          ) : loading ? (
            <Text size="small" className="text-ui-fg-muted">
              Counting…
            </Text>
          ) : (
            <>
              <Text className="text-2xl font-semibold tabular-nums">
                {formatBytes(storage.total_bytes)}
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted">
                {storage.object_count.toLocaleString("en-AU")} objects
                {storage.capped ? " (capped at 100k)" : ""}
              </Text>
              {storage.prefixes && storage.prefixes.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                  {storage.prefixes.slice(0, 4).map((p) => (
                    <Text
                      key={p.prefix}
                      size="xsmall"
                      className="text-ui-fg-muted"
                    >
                      <span style={{ color: PALETTE.slate700 }}>
                        {p.prefix}/
                      </span>{" "}
                      {formatBytes(p.bytes)}
                    </Text>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Vercel Speed Insights */}
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Core Web Vitals (Vercel)
          </Text>
          {speedInsightsUrl ? (
            <a
              href={speedInsightsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: PALETTE.teal700 }}
              className="text-base font-medium underline"
            >
              Open Speed Insights →
            </a>
          ) : (
            <Text size="small" className="text-ui-fg-muted">
              Set VERCEL_SPEED_INSIGHTS_URL to your Vercel project's analytics
              page to deep-link from here.
            </Text>
          )}
          <Text size="xsmall" className="text-ui-fg-muted mt-1">
            LCP / INP / CLS — frontend perf is wasted ad spend.
          </Text>
        </div>

        {/* PostHog */}
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Storefront traffic (PostHog · last{" "}
            {posthog?.windowDays ?? 7} days)
          </Text>
          {!posthog?.configured ? (
            <Text size="small" className="text-ui-fg-muted">
              Set POSTHOG_PERSONAL_API_KEY + POSTHOG_PROJECT_ID to show live
              numbers here. Without them, the tile stays as a deep-link only.
            </Text>
          ) : posthogLoading ? (
            <Text size="small" className="text-ui-fg-muted">
              Loading…
            </Text>
          ) : posthog.error ? (
            <>
              <Text className="text-2xl font-semibold tabular-nums">
                {formatCount(posthog.pageviews)}
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted">
                pageviews · {formatCount(posthog.sessions)} sessions
              </Text>
              <Text
                size="xsmall"
                className="mt-1"
                style={{ color: PALETTE.amber600 }}
              >
                Query error: {posthog.error.slice(0, 140)}
              </Text>
            </>
          ) : (
            <>
              <Text className="text-2xl font-semibold tabular-nums">
                {formatCount(posthog.pageviews)}
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted">
                pageviews · {formatCount(posthog.sessions)} sessions
              </Text>
              {posthog.topPath ? (
                <Text size="xsmall" className="text-ui-fg-muted mt-1">
                  Top page:{" "}
                  <span style={{ color: PALETTE.slate700 }}>
                    {posthog.topPath}
                  </span>{" "}
                  ({formatCount(posthog.topPathViews)})
                </Text>
              ) : null}
            </>
          )}
        </div>
      </div>
    </Container>
  )
}
