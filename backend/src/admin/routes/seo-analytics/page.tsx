import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Table, Text } from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

type GscRow = {
  key: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

type Ga4PageRow = {
  path: string
  sessions: number
  conversions: number
}

type SeoSummary = {
  status: "ok" | "partial" | "error" | "empty"
  generated_at: string
  range: { days: number; start: string; end: string }
  gsc: {
    totals: { clicks: number; impressions: number; ctr: number; position: number }
    topQueries: GscRow[]
    topPages: GscRow[]
    byDay: Array<{ date: string; clicks: number; impressions: number }>
  } | null
  ga4: {
    totals: {
      sessions: number
      conversions: number
      engagedSessions: number
      averageSessionDuration: number
    }
    topPages: Ga4PageRow[]
    byDay: Array<{ date: string; sessions: number }>
  } | null
  errors: Array<{ source: "gsc" | "ga4"; message: string }>
}

type Envelope = { status: SeoSummary["status"]; summary: SeoSummary | null }

const adminFetchPath = (path: string) => {
  const base = (import.meta.env.VITE_BACKEND_URL ?? "").replace(/\/$/, "")
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

const numberFmt = new Intl.NumberFormat("en-AU")
const formatInt = (n: number) => numberFmt.format(Math.round(n))
const formatPct = (n: number) => `${(n * 100).toFixed(2)}%`
const formatPosition = (n: number) => (n > 0 ? n.toFixed(1) : "—")
const formatDuration = (seconds: number) => {
  if (!seconds) return "0s"
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}
const formatDateTime = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })
}

const Kpi = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="flex flex-col gap-1 rounded-md border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
    <Text size="xsmall" className="text-ui-fg-muted uppercase tracking-wide">
      {label}
    </Text>
    <Text size="large" weight="plus">
      {value}
    </Text>
    {hint ? (
      <Text size="xsmall" className="text-ui-fg-muted">
        {hint}
      </Text>
    ) : null}
  </div>
)

const SeoAnalyticsPage = () => {
  const [envelope, setEnvelope] = useState<Envelope | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(adminFetchPath("/admin/seo-analytics"), {
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${await res.text()}`)
      }
      const body = (await res.json()) as Envelope
      setEnvelope(body)
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    try {
      const res = await fetch(adminFetchPath("/admin/seo-analytics/refresh"), {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${await res.text()}`)
      }
      const body = (await res.json()) as Envelope
      setEnvelope(body)
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const summary = envelope?.summary ?? null

  const lastRefreshed = useMemo(() => {
    if (!summary?.generated_at) return null
    return formatDateTime(summary.generated_at)
  }, [summary?.generated_at])

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level="h1">SEO</Heading>
          <Text size="small" className="text-ui-fg-muted mt-1">
            Last 28 days of Google Search Console + Google Analytics 4. Refreshed daily at ~05:00 UTC.
          </Text>
          {lastRefreshed ? (
            <Text size="small" className="text-ui-fg-muted mt-1">
              Last refreshed: {lastRefreshed}
              {summary?.range ? ` · ${summary.range.start} → ${summary.range.end}` : null}
            </Text>
          ) : null}
        </div>
        <Button onClick={onRefresh} isLoading={refreshing} disabled={refreshing}>
          Refresh now
        </Button>
      </div>

      {error ? (
        <Container className="p-4">
          <Text size="small" className="text-ui-fg-error">
            Failed to load: {error}
          </Text>
        </Container>
      ) : null}

      {loading && !summary ? (
        <Container className="p-4">
          <Text size="small" className="text-ui-fg-muted">
            Loading…
          </Text>
        </Container>
      ) : null}

      {!loading && envelope?.status === "empty" ? (
        <Container className="p-4">
          <Text size="small">
            No data cached yet. Set <code className="text-xs">GOOGLE_SERVICE_ACCOUNT_JSON</code>,{" "}
            <code className="text-xs">GSC_SITE_URL</code>, and <code className="text-xs">GA4_PROPERTY_ID</code>{" "}
            in backend env, then click <strong>Refresh now</strong>.
          </Text>
        </Container>
      ) : null}

      {summary?.errors.length ? (
        <Container className="p-4">
          <Text size="small" weight="plus" className="text-ui-fg-error">
            {summary.status === "partial"
              ? "One source failed — partial data shown:"
              : "Source errors:"}
          </Text>
          <ul className="mt-1 list-disc pl-5 text-sm text-ui-fg-error">
            {summary.errors.map((e, i) => (
              <li key={i}>
                <strong>{e.source.toUpperCase()}</strong>: {e.message}
              </li>
            ))}
          </ul>
        </Container>
      ) : null}

      {summary?.gsc ? (
        <Container className="flex flex-col gap-4 p-6">
          <Heading level="h2">Search Console</Heading>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="Clicks" value={formatInt(summary.gsc.totals.clicks)} />
            <Kpi label="Impressions" value={formatInt(summary.gsc.totals.impressions)} />
            <Kpi label="CTR" value={formatPct(summary.gsc.totals.ctr)} />
            <Kpi
              label="Avg position"
              value={formatPosition(summary.gsc.totals.position)}
              hint="lower is better"
            />
          </div>
        </Container>
      ) : null}

      {summary?.ga4 ? (
        <Container className="flex flex-col gap-4 p-6">
          <Heading level="h2">Analytics</Heading>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="Sessions" value={formatInt(summary.ga4.totals.sessions)} />
            <Kpi label="Conversions" value={formatInt(summary.ga4.totals.conversions)} />
            <Kpi label="Engaged sessions" value={formatInt(summary.ga4.totals.engagedSessions)} />
            <Kpi
              label="Avg session"
              value={formatDuration(summary.ga4.totals.averageSessionDuration)}
            />
          </div>
        </Container>
      ) : null}

      {summary?.gsc?.topQueries.length ? (
        <Container className="flex flex-col gap-3 p-6">
          <Heading level="h2">Top search queries</Heading>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Query</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Clicks</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Impressions</Table.HeaderCell>
                <Table.HeaderCell className="text-right">CTR</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Position</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {summary.gsc.topQueries.map((row, i) => (
                <Table.Row key={`${row.key}-${i}`}>
                  <Table.Cell>{row.key || "(unknown)"}</Table.Cell>
                  <Table.Cell className="text-right">{formatInt(row.clicks)}</Table.Cell>
                  <Table.Cell className="text-right">{formatInt(row.impressions)}</Table.Cell>
                  <Table.Cell className="text-right">{formatPct(row.ctr)}</Table.Cell>
                  <Table.Cell className="text-right">{formatPosition(row.position)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Container>
      ) : null}

      {summary?.gsc?.topPages.length ? (
        <Container className="flex flex-col gap-3 p-6">
          <Heading level="h2">Top landing pages</Heading>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Page</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Clicks</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Impressions</Table.HeaderCell>
                <Table.HeaderCell className="text-right">CTR</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Position</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {summary.gsc.topPages.map((row, i) => (
                <Table.Row key={`${row.key}-${i}`}>
                  <Table.Cell className="max-w-[40ch] truncate" title={row.key}>
                    {row.key || "(unknown)"}
                  </Table.Cell>
                  <Table.Cell className="text-right">{formatInt(row.clicks)}</Table.Cell>
                  <Table.Cell className="text-right">{formatInt(row.impressions)}</Table.Cell>
                  <Table.Cell className="text-right">{formatPct(row.ctr)}</Table.Cell>
                  <Table.Cell className="text-right">{formatPosition(row.position)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Container>
      ) : null}

      {summary?.ga4?.topPages.length ? (
        <Container className="flex flex-col gap-3 p-6">
          <Heading level="h2">Top pages by sessions (GA4)</Heading>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Path</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Sessions</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Conversions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {summary.ga4.topPages.map((row, i) => (
                <Table.Row key={`${row.path}-${i}`}>
                  <Table.Cell className="max-w-[40ch] truncate" title={row.path}>
                    {row.path || "(unknown)"}
                  </Table.Cell>
                  <Table.Cell className="text-right">{formatInt(row.sessions)}</Table.Cell>
                  <Table.Cell className="text-right">{formatInt(row.conversions)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Container>
      ) : null}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "SEO",
  rank: 99,
})

export default SeoAnalyticsPage
