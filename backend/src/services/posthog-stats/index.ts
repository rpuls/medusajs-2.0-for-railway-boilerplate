import {
  POSTHOG_HOST,
  POSTHOG_PERSONAL_API_KEY,
  POSTHOG_PROJECT_ID,
} from "../../lib/constants"

const DEFAULT_HOST = "https://us.i.posthog.com"

export type PostHogStats = {
  configured: boolean
  pageviews: number
  sessions: number
  topPath: string | null
  topPathViews: number
  windowDays: number
  error?: string
}

function emptyStats(days: number): PostHogStats {
  return {
    configured: false,
    pageviews: 0,
    sessions: 0,
    topPath: null,
    topPathViews: 0,
    windowDays: days,
  }
}

function hostBase(): string {
  const raw = (POSTHOG_HOST ?? "").trim()
  const host = raw.length > 0 ? raw : DEFAULT_HOST
  return host.replace(/\/$/, "")
}

async function runHogQL<T>(query: string): Promise<T[][]> {
  const url = `${hostBase()}/api/projects/${POSTHOG_PROJECT_ID}/query/`
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: { kind: "HogQLQuery", query },
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      `PostHog query failed (${res.status}): ${text.slice(0, 300)}`
    )
  }
  const json = (await res.json()) as { results?: T[][] }
  return json.results ?? []
}

/**
 * Pulls a small set of "is the storefront alive" signals from PostHog for the
 * last `days` days, intended for the Reports page operational tile. Uses
 * HogQL queries against the events table — keeps logic in PostHog so we don't
 * have to reproduce session-attribution logic on our side.
 *
 * Returns `configured: false` (with zeros) when env vars are missing, so the
 * tile can render a setup hint without a try/catch wrapper. Errors during the
 * fetch surface in `error` instead of throwing — the tile should show whatever
 * data did come back plus the error string.
 */
export async function fetchPostHogStats(days = 7): Promise<PostHogStats> {
  if (!POSTHOG_PERSONAL_API_KEY || !POSTHOG_PROJECT_ID) {
    return emptyStats(days)
  }

  const totalsQuery = `
    SELECT
      count() AS pageviews,
      count(DISTINCT properties.$session_id) AS sessions
    FROM events
    WHERE event = '$pageview'
      AND timestamp > now() - INTERVAL ${days} DAY
  `

  const topPathQuery = `
    SELECT
      properties.$pathname AS path,
      count() AS views
    FROM events
    WHERE event = '$pageview'
      AND timestamp > now() - INTERVAL ${days} DAY
      AND properties.$pathname IS NOT NULL
    GROUP BY path
    ORDER BY views DESC
    LIMIT 1
  `

  try {
    const [totalsRows, topRows] = await Promise.all([
      runHogQL<number>(totalsQuery),
      runHogQL<string | number>(topPathQuery),
    ])

    const totals = totalsRows[0] ?? [0, 0]
    const top = topRows[0] ?? [null, 0]

    return {
      configured: true,
      pageviews: Number(totals[0] ?? 0),
      sessions: Number(totals[1] ?? 0),
      topPath: (top[0] as string | null) ?? null,
      topPathViews: Number(top[1] ?? 0),
      windowDays: days,
    }
  } catch (err: any) {
    return {
      configured: true,
      pageviews: 0,
      sessions: 0,
      topPath: null,
      topPathViews: 0,
      windowDays: days,
      error: err?.message ?? String(err),
    }
  }
}
