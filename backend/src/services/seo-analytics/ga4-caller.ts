import { BetaAnalyticsDataClient } from "@google-analytics/data"
import { google } from "googleapis"
import type { analyticsdata_v1beta } from "googleapis"

import { getImpersonationSubject, getServiceAccountKey } from "./google-auth"

const SCOPE = "https://www.googleapis.com/auth/analytics.readonly"

/**
 * Uniform GA4 caller used by every report that touches the GA4 Data API.
 *
 * Why not just use BetaAnalyticsDataClient everywhere?
 * The official @google-analytics/data SDK is gRPC-first and breaks in three
 * stacked ways under Domain-Wide Delegation (subject impersonation):
 *   raw JWT          → 'this.auth.getUniverseDomain is not a function'
 *   GoogleAuth+gRPC  → 'headers.forEach is not a function'
 *   GoogleAuth+REST  → 'auth.fetch is not a function'
 *
 * So when SEO_IMPERSONATION_USER is set, we route every GA4 call through
 * googleapis.analyticsdata (a plain REST client that already plays nicely
 * with google.auth.JWT + subject — same auth shape gsc-client uses). When
 * unset, we keep BetaAnalyticsDataClient — that path works fine and avoids
 * touching the dev/test code path.
 *
 * The Ga4Caller interface normalises the two transports' response shapes so
 * consumer code can read `response.rows` without caring which transport ran:
 *   - REST: `data.rows`
 *   - gRPC: `[response, ?, ?]` tuple where `response.rows` holds the schema
 */
export type Ga4Row = analyticsdata_v1beta.Schema$Row

export type Ga4Result = { rows: Ga4Row[] }

/**
 * Loose RunReport request shape — covers everything our consumers use today
 * (metrics, dimensions, orderBys, limit, dimensionFilter, etc.) and passes
 * through to whichever underlying SDK we resolve. We keep this loose because
 * GA4 has many optional fields and we don't want to chase the schema.
 */
export type Ga4RunReportRequest = {
  property: string
  dateRanges: { startDate: string; endDate: string }[]
  metrics?: { name: string }[]
  dimensions?: { name: string }[]
  orderBys?: any[]
  limit?: number
  dimensionFilter?: any
  metricFilter?: any
  [key: string]: any
}

export interface Ga4Caller {
  runReport(req: Ga4RunReportRequest): Promise<Ga4Result>
}

export function buildGa4Caller(): Ga4Caller {
  const key = getServiceAccountKey()
  const subject = getImpersonationSubject()

  if (subject) {
    const jwt = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: [SCOPE],
      subject,
    })
    const analyticsdata = google.analyticsdata({ version: "v1beta", auth: jwt })
    return {
      async runReport(req) {
        const { property, limit, ...rest } = req
        const res = await analyticsdata.properties.runReport({
          property,
          requestBody: {
            ...rest,
            limit: limit !== undefined ? String(limit) : undefined,
          } as any,
        })
        return { rows: (res.data.rows ?? []) as Ga4Row[] }
      },
    }
  }

  const client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key,
    },
  })
  return {
    async runReport(req) {
      const [res] = await client.runReport(req as any)
      return { rows: (res.rows ?? []) as unknown as Ga4Row[] }
    },
  }
}
