import { Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { PALETTE } from "../../lib/reports/palette"

type StorageResponse = {
  configured: boolean
  bucket: string | null
  total_bytes: number
  object_count: number
  capped: boolean
  prefixes?: Array<{ prefix: string; bytes: number; count: number }>
  error?: string
}

const formatBytes = (n: number): string => {
  if (n < 1024) return `${n} B`
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`
  return `${(n / 1024 ** 3).toFixed(2)} GB`
}

/**
 * Compact strip of "operational health" tiles that doesn't need the full
 * report-card treatment: MinIO storage size + a click-out to Vercel Speed
 * Insights. Both are external-data signals where the actual dashboard is
 * better than re-implementing it here.
 *
 * The Speed Insights link is only rendered when VERCEL_SPEED_INSIGHTS_URL
 * is set on the *admin frontend* build, surfaced via a tiny `/admin/reports/config`
 * route response or — simpler — a NEXT_PUBLIC env var injected at build time.
 * Default behavior: render the placeholder + setup hint.
 */
const SPEED_INSIGHTS_URL =
  typeof process !== "undefined" &&
  typeof (process as any).env?.VERCEL_SPEED_INSIGHTS_URL === "string"
    ? (process as any).env.VERCEL_SPEED_INSIGHTS_URL
    : null

export const OperationalTiles = () => {
  const [storage, setStorage] = useState<StorageResponse | null>(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <Container className="flex flex-col gap-y-2 p-4">
      <Heading level="h2" className="text-base font-semibold">
        Operational tiles
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
          {SPEED_INSIGHTS_URL ? (
            <a
              href={SPEED_INSIGHTS_URL}
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
            Session replays + funnel insights (PostHog)
          </Text>
          <Text size="small" className="text-ui-fg-muted">
            Open posthog.com → SC Prints project → Replays / Insights for
            session-level analysis. Wired to fire pageviews + identifies
            already.
          </Text>
        </div>
      </div>
    </Container>
  )
}
