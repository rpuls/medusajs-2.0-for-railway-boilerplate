import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import {
  ASCOLOUR_BASE_URL,
  ASCOLOUR_SUBSCRIPTION_KEY,
  GOOGLE_SERVICE_ACCOUNT_JSON,
  MEILISEARCH_HOST,
  MINIO_ENDPOINT,
  RESEND_API_KEY,
  SHIPSTATION_API_KEY,
  STRIPE_API_KEY,
} from "../../../../lib/constants"

/**
 * GET /admin/reports/system-health
 *
 * Light-touch reachability check for every external service the
 * platform depends on. Designed to be called every 60s by the header
 * "system health pill" — keep it cheap. Each check has a 4s budget.
 *
 * Each service returns one of:
 *   - "ok"        reachable + auth accepted
 *   - "degraded"  reachable but returned an unexpected response
 *   - "down"      unreachable / explicit auth failure
 *   - "unset"     env vars missing — service isn't expected to work
 */

type Status = "ok" | "degraded" | "down" | "unset"

type Check = {
  service: string
  status: Status
  latency_ms: number | null
  detail?: string | null
}

const TIMEOUT_MS = 4000

const ping = async (
  service: string,
  options: {
    configured: boolean
    url?: string
    headers?: Record<string, string>
    expectedOkStatuses?: number[]
  }
): Promise<Check> => {
  if (!options.configured) {
    return { service, status: "unset", latency_ms: null, detail: "env var missing" }
  }
  if (!options.url) {
    return {
      service,
      status: "unset",
      latency_ms: null,
      detail: "no health URL",
    }
  }
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS)
  const start = Date.now()
  try {
    const r = await fetch(options.url, {
      method: "GET",
      headers: options.headers,
      signal: ac.signal,
    })
    const latency = Date.now() - start
    const expected = options.expectedOkStatuses ?? [200, 201, 204, 401, 403]
    if (expected.includes(r.status)) {
      // 401/403 mean auth wasn't accepted — but the service answered, so
      // it's reachable. Return ok unless we explicitly authenticated.
      if (r.status === 401 || r.status === 403) {
        return {
          service,
          status: options.headers ? "degraded" : "ok",
          latency_ms: latency,
          detail: `HTTP ${r.status}`,
        }
      }
      return { service, status: "ok", latency_ms: latency, detail: null }
    }
    return {
      service,
      status: "degraded",
      latency_ms: latency,
      detail: `HTTP ${r.status}`,
    }
  } catch (err: any) {
    return {
      service,
      status: "down",
      latency_ms: Date.now() - start,
      detail: err?.name === "AbortError" ? "timeout" : err?.message ?? String(err),
    }
  } finally {
    clearTimeout(timer)
  }
}

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  // MinIO health URL: bucket existence is a cheap probe but uses the
  // SDK; for HTTP-only reachability we just hit the root endpoint.
  let minioUrl: string | null = null
  if (MINIO_ENDPOINT) {
    minioUrl = MINIO_ENDPOINT.startsWith("http")
      ? `${MINIO_ENDPOINT.replace(/\/$/, "")}/minio/health/live`
      : `https://${MINIO_ENDPOINT.replace(/\/$/, "")}/minio/health/live`
  }

  const checks = await Promise.all([
    ping("Stripe", {
      configured: Boolean(STRIPE_API_KEY),
      url: "https://api.stripe.com/v1/charges?limit=1",
      headers: STRIPE_API_KEY
        ? { Authorization: `Bearer ${STRIPE_API_KEY}` }
        : undefined,
    }),
    ping("Resend", {
      configured: Boolean(RESEND_API_KEY),
      url: "https://api.resend.com/domains",
      headers: RESEND_API_KEY
        ? { Authorization: `Bearer ${RESEND_API_KEY}` }
        : undefined,
    }),
    ping("ShipStation", {
      configured: Boolean(SHIPSTATION_API_KEY),
      url: "https://api.shipstation.com/v2/carriers",
      headers: SHIPSTATION_API_KEY
        ? { "API-Key": SHIPSTATION_API_KEY }
        : undefined,
    }),
    ping("MinIO", {
      configured: Boolean(MINIO_ENDPOINT),
      url: minioUrl ?? undefined,
      expectedOkStatuses: [200, 204, 403],
    }),
    ping("AS Colour", {
      configured: Boolean(ASCOLOUR_SUBSCRIPTION_KEY),
      url: ASCOLOUR_BASE_URL ? `${ASCOLOUR_BASE_URL.replace(/\/$/, "")}/products?limit=1` : undefined,
      headers: ASCOLOUR_SUBSCRIPTION_KEY
        ? { "Ocp-Apim-Subscription-Key": ASCOLOUR_SUBSCRIPTION_KEY }
        : undefined,
    }),
    ping("Meilisearch", {
      configured: Boolean(MEILISEARCH_HOST),
      url: MEILISEARCH_HOST
        ? `${MEILISEARCH_HOST.replace(/\/$/, "")}/health`
        : undefined,
    }),
    ping("Google APIs", {
      configured: Boolean(GOOGLE_SERVICE_ACCOUNT_JSON),
      url: "https://oauth2.googleapis.com/",
      expectedOkStatuses: [200, 400, 404],
    }),
  ])

  const overall: Status = checks.some((c) => c.status === "down")
    ? "down"
    : checks.some((c) => c.status === "degraded")
      ? "degraded"
      : "ok"

  return res.json({
    overall,
    checked_at: new Date().toISOString(),
    services: checks,
  })
}
