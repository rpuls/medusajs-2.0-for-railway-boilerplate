import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import net from "node:net"
import tls from "node:tls"
import { Client as PgClient } from "pg"

import {
  ASCOLOUR_BASE_URL,
  ASCOLOUR_SUBSCRIPTION_KEY,
  DATABASE_URL,
  GOOGLE_SERVICE_ACCOUNT_JSON,
  MEILISEARCH_HOST,
  MINIO_ENDPOINT,
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
  PAYPAL_IS_SANDBOX,
  POSTHOG_HOST,
  POSTHOG_PERSONAL_API_KEY,
  POSTHOG_PROJECT_ID,
  REDIS_URL,
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

const checkPostgres = async (): Promise<Check> => {
  if (!DATABASE_URL) {
    return { service: "Postgres", status: "unset", latency_ms: null, detail: "DATABASE_URL missing" }
  }
  const start = Date.now()
  const client = new PgClient({
    connectionString: DATABASE_URL,
    connectionTimeoutMillis: TIMEOUT_MS,
    statement_timeout: TIMEOUT_MS,
  })
  try {
    await client.connect()
    await client.query("SELECT 1")
    return { service: "Postgres", status: "ok", latency_ms: Date.now() - start, detail: null }
  } catch (err: any) {
    return {
      service: "Postgres",
      status: "down",
      latency_ms: Date.now() - start,
      detail: err?.message ?? String(err),
    }
  } finally {
    client.end().catch(() => {})
  }
}

const checkRedis = async (): Promise<Check> => {
  if (!REDIS_URL) {
    return { service: "Redis", status: "unset", latency_ms: null, detail: "REDIS_URL missing" }
  }
  let host: string
  let port: number
  let useTls: boolean
  try {
    const u = new URL(REDIS_URL)
    host = u.hostname
    port = u.port ? Number(u.port) : 6379
    // `rediss://` (TLS) — Upstash and other managed Redis services require this.
    useTls = u.protocol === "rediss:"
  } catch (err: any) {
    return {
      service: "Redis",
      status: "down",
      latency_ms: null,
      detail: `invalid REDIS_URL: ${err?.message ?? err}`,
    }
  }
  const start = Date.now()
  return new Promise<Check>((resolve) => {
    const socket: net.Socket = useTls
      ? tls.connect({ host, port, servername: host })
      : new net.Socket()
    let settled = false
    const finish = (c: Check) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(c)
    }
    const sendPing = () => {
      // Send PING; expect "+PONG\r\n" back. With AUTH required, server will
      // reply "-NOAUTH" which we treat as reachable.
      socket.write("*1\r\n$4\r\nPING\r\n")
    }
    socket.setTimeout(TIMEOUT_MS)
    if (useTls) {
      // TLS socket — handshake completes on `secureConnect`, not `connect`.
      ;(socket as tls.TLSSocket).once("secureConnect", sendPing)
    } else {
      socket.once("connect", sendPing)
    }
    socket.once("data", (buf) => {
      const reply = buf.toString("utf8")
      const latency = Date.now() - start
      if (reply.startsWith("+PONG")) {
        finish({ service: "Redis", status: "ok", latency_ms: latency, detail: null })
      } else if (reply.startsWith("-NOAUTH") || reply.startsWith("-WRONGPASS")) {
        // Reachable but auth required for PING — fine, treat as ok.
        finish({ service: "Redis", status: "ok", latency_ms: latency, detail: "auth required" })
      } else {
        finish({
          service: "Redis",
          status: "degraded",
          latency_ms: latency,
          detail: reply.slice(0, 40).trim() || "unexpected reply",
        })
      }
    })
    socket.once("timeout", () => {
      finish({
        service: "Redis",
        status: "down",
        latency_ms: Date.now() - start,
        detail: "timeout",
      })
    })
    socket.once("error", (err) => {
      finish({
        service: "Redis",
        status: "down",
        latency_ms: Date.now() - start,
        detail: err.message,
      })
    })
    if (!useTls) {
      socket.connect(port, host)
    }
  })
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

  const paypalHost = PAYPAL_IS_SANDBOX
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com"

  const posthogHost = (POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/$/, "")

  const checks = await Promise.all([
    checkPostgres(),
    checkRedis(),
    ping("Stripe", {
      configured: Boolean(STRIPE_API_KEY),
      url: "https://api.stripe.com/v1/charges?limit=1",
      headers: STRIPE_API_KEY
        ? { Authorization: `Bearer ${STRIPE_API_KEY}` }
        : undefined,
    }),
    ping("PayPal", {
      configured: Boolean(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET),
      // Unauthenticated GET on the OAuth endpoint returns 401 — proves
      // reachability without burning an access token.
      url: `${paypalHost}/v1/oauth2/token`,
      expectedOkStatuses: [200, 401, 405],
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
      // /v2/environment/account is a small auth-gated payload — much
      // faster than /v2/carriers which returns every carrier service.
      url: "https://api.shipstation.com/v2/environment/account",
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
      url: ASCOLOUR_BASE_URL
        ? `${ASCOLOUR_BASE_URL.replace(/\/$/, "")}/catalog/products?pageSize=1`
        : undefined,
      headers: ASCOLOUR_SUBSCRIPTION_KEY
        ? { "Subscription-Key": ASCOLOUR_SUBSCRIPTION_KEY }
        : undefined,
    }),
    ping("Meilisearch", {
      configured: Boolean(MEILISEARCH_HOST),
      url: MEILISEARCH_HOST
        ? `${MEILISEARCH_HOST.replace(/\/$/, "")}/health`
        : undefined,
    }),
    ping("PostHog", {
      configured: Boolean(POSTHOG_PERSONAL_API_KEY && POSTHOG_PROJECT_ID),
      url: `${posthogHost}/api/projects/${POSTHOG_PROJECT_ID}/`,
      headers: POSTHOG_PERSONAL_API_KEY
        ? { Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}` }
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
