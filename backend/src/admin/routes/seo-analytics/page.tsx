import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Table, Text } from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"

import { HelpTooltip, type HelpContent } from "../../components/reports/help-tooltip"

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

const Kpi = ({
  label,
  value,
  hint,
  help,
}: {
  label: string
  value: string
  hint?: string
  help?: HelpContent
}) => (
  <div className="flex flex-col gap-1 rounded-md border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
    <Text
      size="xsmall"
      className="text-ui-fg-muted uppercase tracking-wide flex items-center"
    >
      {label}
      {help ? <HelpTooltip text={help} size={12} /> : null}
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

const SectionHeading = ({ children, help }: { children: ReactNode; help?: HelpContent }) => (
  <Heading level="h2" className="flex items-center">
    {children}
    {help ? <HelpTooltip text={help} /> : null}
  </Heading>
)

const ColumnHeader = ({ children, help }: { children: ReactNode; help?: HelpContent }) => (
  <span className="inline-flex items-center justify-end">
    {children}
    {help ? <HelpTooltip text={help} size={12} /> : null}
  </span>
)

// Help copy reused across the four GSC table column headers
const HELP_GSC_CTR: HelpContent = {
  title: "Click-through rate",
  body: "Of every 100 times this query/page appeared in Google search results, how many times someone actually clicked through. CTR depends on rank, snippet, and competitive context.",
  bullets: [
    "Position 1 typically earns 25–35% CTR; position 5 around 5%; below position 10 it falls under 2%.",
    "Drops without a position change usually mean a competitor changed their snippet — refresh your meta description.",
    "Very-high CTR at low position can mean the snippet is misleading users; check that the page actually delivers what the query promises.",
  ],
}

const HELP_GSC_POSITION: HelpContent = {
  title: "Average position",
  body: "Where, on average, this query/page ranked in Google search results during the window. Lower number = higher up the page; 1 means the very top result.",
  bullets: [
    "Position averages across every search where the URL appeared, including position 90 long-tail mentions — so a 'high' average can hide some great rankings.",
    "Use it as a coarse indicator. For real ranking decisions check Google Search Console directly with date filters.",
    "Position improvements usually take 4–8 weeks to reflect after content changes.",
  ],
}

const HELP_GSC_CLICKS: HelpContent = {
  title: "Clicks",
  body: "Total number of clicks from Google search results to this query/page during the window. The bottom of the SEO funnel — the only metric that translates directly to traffic.",
}

const HELP_GSC_IMPRESSIONS: HelpContent = {
  title: "Impressions",
  body: "How many times your URL appeared in Google search results in the window — whether or not the user clicked. Tells you reach, before factoring in clickthrough.",
  bullets: [
    "Rising impressions + flat clicks usually means new keyword opportunities you're showing for but not optimised for. Worth a meta refresh.",
    "Falling impressions = lost rankings or fewer searches in the topic. Check Google Trends for the latter before assuming a SEO problem.",
  ],
}

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
          <SectionHeading
            help={{
              title: "Search Console",
              body: "Aggregated SEO performance pulled from Google Search Console for the configured site. Tells you what queries Google is showing your site for, where you rank, and which queries actually earn clicks.",
              bullets: [
                "Data refreshes daily at ~05:00 UTC via the refresh-seo-analytics cron; click 'Refresh now' to force a re-pull on demand.",
                "GSC numbers trail real time by 2–3 days, so the most recent end of the window may be partial.",
                "Configured via GSC_SITE_URL env var — must match the property exactly (e.g. 'https://sc-prints.com.au/' or 'sc-domain:sc-prints.com.au').",
              ],
            }}
          >
            Search Console
          </SectionHeading>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi
              label="Clicks"
              value={formatInt(summary.gsc.totals.clicks)}
              help={HELP_GSC_CLICKS}
            />
            <Kpi
              label="Impressions"
              value={formatInt(summary.gsc.totals.impressions)}
              help={HELP_GSC_IMPRESSIONS}
            />
            <Kpi
              label="CTR"
              value={formatPct(summary.gsc.totals.ctr)}
              help={HELP_GSC_CTR}
            />
            <Kpi
              label="Avg position"
              value={formatPosition(summary.gsc.totals.position)}
              hint="lower is better"
              help={HELP_GSC_POSITION}
            />
          </div>
        </Container>
      ) : null}

      {summary?.ga4 ? (
        <Container className="flex flex-col gap-4 p-6">
          <SectionHeading
            help={{
              title: "Analytics (GA4)",
              body: "Aggregated traffic and engagement signals from Google Analytics 4. Tells you who's visiting and what they're doing, complementing GSC's 'how they found you' data.",
              bullets: [
                "GA4 has its own attribution and counting model — numbers won't tie out exactly with GSC clicks. They're complementary signals, not interchangeable.",
                "Configured via GA4_PROPERTY_ID env var (numeric, not the measurement ID).",
                "Historic data only goes back as far as GA4 has been collecting; pre-Universal-Analytics cutover data isn't visible here.",
              ],
            }}
          >
            Analytics
          </SectionHeading>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi
              label="Sessions"
              value={formatInt(summary.ga4.totals.sessions)}
              help={{
                title: "Sessions",
                body: "A session is a group of user interactions within a 30-minute window of activity. One person browsing in the morning and again in the evening counts as two sessions.",
                bullets: [
                  "Sessions ≠ unique visitors — a returning visitor adds another session, not a new user.",
                  "GA4 closes a session after 30 minutes of inactivity; a new burst of activity starts a new session.",
                ],
              }}
            />
            <Kpi
              label="Conversions"
              value={formatInt(summary.ga4.totals.conversions)}
              help={{
                title: "Conversions",
                body: "Count of GA4 conversion events fired in the window. Defined by what events you mark as conversions in the GA4 admin — typically purchases, but can include sign-ups, form-submits, etc.",
                bullets: [
                  "If this is empty, no events have been marked as conversions in your GA4 property — set it up in GA4 admin → Events.",
                  "For ecommerce, the 'purchase' event is the conventional conversion to mark.",
                ],
              }}
            />
            <Kpi
              label="Engaged sessions"
              value={formatInt(summary.ga4.totals.engagedSessions)}
              help={{
                title: "Engaged sessions",
                body: "Sessions where the user did at least one of: stayed >10 seconds, fired a conversion event, or visited 2+ pages. GA4's bounce-rate replacement.",
                bullets: [
                  "Engaged sessions ÷ total sessions = engagement rate. Healthy stores see 50–70%.",
                  "A low engagement rate means either fast-bouncing traffic (mismatched audience) or a bad first-impression page.",
                ],
              }}
            />
            <Kpi
              label="Avg session"
              value={formatDuration(summary.ga4.totals.averageSessionDuration)}
              help={{
                title: "Average session duration",
                body: "How long a typical session lasts, averaged across all sessions in the window. Includes engaged and bounced visitors.",
                bullets: [
                  "Useful as a trend, not a target — compare against last month, not against an absolute number.",
                  "Sessions where the user closes the tab without firing another event count as 0 seconds in GA4 — drags the average down.",
                ],
              }}
            />
          </div>
        </Container>
      ) : null}

      {summary?.gsc?.topQueries.length ? (
        <Container className="flex flex-col gap-3 p-6">
          <SectionHeading
            help={{
              title: "Top search queries",
              body: "The queries that drove the most impressions to your site, with click and ranking data for each. The top of this list is your branded + most-relevant traffic.",
              bullets: [
                "High impressions + low clicks for a query = an opportunity. You're showing for it — fix the snippet to start earning the click.",
                "Branded queries (your store name) typically dominate the top — that's healthy. Filter mentally to non-branded to spot growth opportunities.",
                "Limited to the top 100 queries by impressions — long-tail data lives in GSC directly.",
              ],
            }}
          >
            Top search queries
          </SectionHeading>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Query</Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  <ColumnHeader help={HELP_GSC_CLICKS}>Clicks</ColumnHeader>
                </Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  <ColumnHeader help={HELP_GSC_IMPRESSIONS}>Impressions</ColumnHeader>
                </Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  <ColumnHeader help={HELP_GSC_CTR}>CTR</ColumnHeader>
                </Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  <ColumnHeader help={HELP_GSC_POSITION}>Position</ColumnHeader>
                </Table.HeaderCell>
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
          <SectionHeading
            help={{
              title: "Top landing pages (GSC)",
              body: "Your pages ranked by GSC impressions — i.e. how often each page appeared in Google search results. Tells you which pages are doing the SEO work.",
              bullets: [
                "Different from GA4 'top landing pages': this is GSC's view of which pages Google ranks. The same page may show up in both reports with different numbers.",
                "If your homepage dominates with low CTR, your snippet is generic. PDPs that rank well often deserve more internal-link love from blog content.",
                "A page that appears here with a high position but very low clicks is usually a meta-description problem.",
              ],
            }}
          >
            Top landing pages
          </SectionHeading>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Page</Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  <ColumnHeader help={HELP_GSC_CLICKS}>Clicks</ColumnHeader>
                </Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  <ColumnHeader help={HELP_GSC_IMPRESSIONS}>Impressions</ColumnHeader>
                </Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  <ColumnHeader help={HELP_GSC_CTR}>CTR</ColumnHeader>
                </Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  <ColumnHeader help={HELP_GSC_POSITION}>Position</ColumnHeader>
                </Table.HeaderCell>
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
          <SectionHeading
            help={{
              title: "Top pages by sessions (GA4)",
              body: "GA4's view of which pages your visitors are actually landing on or browsing — independent of where they came from. Use this to spot pages doing the engagement work.",
              bullets: [
                "Compares to GSC 'Top landing pages' but counts all sessions, not just search-driven ones. Page paths that show up here without a strong GSC signal are getting traffic from email, social, or direct.",
                "Conversions column = ecommerce conversions on that page. Useful for spotting which pages are pulling weight at the bottom of the funnel.",
                "Limited to top pages by session count — long-tail pages live in GA4 directly.",
              ],
            }}
          >
            Top pages by sessions (GA4)
          </SectionHeading>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Path</Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  <ColumnHeader
                    help={{
                      title: "Sessions",
                      body: "Number of GA4 sessions that included this page. Counts every session that visited the path, not just sessions that started there.",
                    }}
                  >
                    Sessions
                  </ColumnHeader>
                </Table.HeaderCell>
                <Table.HeaderCell className="text-right">
                  <ColumnHeader
                    help={{
                      title: "Conversions",
                      body: "GA4 conversion events fired during sessions that included this page. Useful for finding the pages that disproportionately drive the bottom of the funnel.",
                    }}
                  >
                    Conversions
                  </ColumnHeader>
                </Table.HeaderCell>
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
