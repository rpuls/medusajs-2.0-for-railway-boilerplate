import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  POSTHOG_HOST,
  POSTHOG_PERSONAL_API_KEY,
  POSTHOG_PROJECT_ID,
} from "../../lib/constants"

export type JourneyEvent = {
  source: "order" | "posthog" | "nps" | "tag" | "design"
  at: string
  title: string
  detail?: string | null
  href?: string | null
}

const DEFAULT_HOST = "https://us.i.posthog.com"
const hostBase = () => (POSTHOG_HOST ?? DEFAULT_HOST).replace(/\/$/, "")

const isPostHogConfigured = (): boolean =>
  Boolean(POSTHOG_PERSONAL_API_KEY && POSTHOG_PROJECT_ID)

/**
 * Aggregates everything we know about a customer's interactions with
 * SC Prints into a single timeline:
 *   - PostHog events keyed by the customer's email (recent 30 days)
 *   - Orders the customer placed
 *   - NPS responses on those orders
 *   - Saved designs
 *   - Customer tag changes (audit log doesn't exist yet, so this is
 *     a no-op today — left as a hook for future)
 *
 * PostHog is queried via HogQL using the customer's email as the
 * distinct_id filter (matches how `phIdentify` is called in the
 * storefront).
 */
export async function buildCustomerJourney(
  container: MedusaContainer,
  customerId: string,
  options: { limit?: number; days?: number } = {}
): Promise<{
  events: JourneyEvent[]
  posthog_configured: boolean
}> {
  const limit = options.limit ?? 200
  const days = options.days ?? 30
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // ---- Look up the customer email ----
  let customer: any
  try {
    const { data } = await query.graph({
      entity: "customer",
      fields: ["id", "email"],
      filters: { id: customerId },
    })
    customer = (data as any[])?.[0]
  } catch {
    customer = null
  }

  const events: JourneyEvent[] = []

  // ---- Orders ----
  if (customer?.id) {
    try {
      const { data: orders } = await query.graph({
        entity: "order",
        fields: ["id", "display_id", "created_at", "total", "currency_code", "metadata"],
        filters: { customer_id: customer.id },
        pagination: { take: 200, skip: 0 },
      })
      for (const o of (orders as any[]) ?? []) {
        if (!o?.created_at) continue
        events.push({
          source: "order",
          at: o.created_at as string,
          title: `Placed order #${o.display_id ?? o.id.slice(-6)}`,
          detail: `${o.currency_code?.toUpperCase() ?? "AUD"} ${(typeof o.total === "number" ? o.total : Number.parseFloat(String(o.total ?? 0))).toFixed(2)}`,
          href: `/app/orders/${o.id}`,
        })
        const meta = (o.metadata ?? {}) as Record<string, unknown>
        if (typeof meta.nps_recorded_at === "string") {
          events.push({
            source: "nps",
            at: meta.nps_recorded_at,
            title:
              typeof meta.nps_score === "number"
                ? `NPS — ${meta.nps_score}/5`
                : "NPS response",
            detail:
              typeof meta.nps_comment === "string"
                ? (meta.nps_comment as string)
                : null,
            href: `/app/orders/${o.id}`,
          })
        }
      }
    } catch {
      // soft fail
    }

    // ---- Saved designs ----
    try {
      const { data: designs } = await query.graph({
        entity: "design",
        fields: ["id", "name", "created_at"],
        filters: { customer_id: customer.id },
        pagination: { take: 200, skip: 0 },
      })
      for (const d of (designs as any[]) ?? []) {
        if (!d?.created_at) continue
        events.push({
          source: "design",
          at: d.created_at as string,
          title: `Saved design "${d.name}"`,
          detail: null,
          href: null,
        })
      }
    } catch {
      // soft fail
    }

    // ---- Customer tags (treat created_at as the event timestamp) ----
    try {
      const { data: tags } = await query.graph({
        entity: "customer_tag",
        fields: ["id", "label", "color", "created_at", "created_by"],
        filters: { customer_id: customer.id },
        pagination: { take: 200, skip: 0 },
      })
      for (const t of (tags as any[]) ?? []) {
        if (!t?.created_at) continue
        events.push({
          source: "tag",
          at: t.created_at as string,
          title: `Tagged "${t.label}"`,
          detail: t.created_by ? `by ${t.created_by}` : null,
        })
      }
    } catch {
      // soft fail
    }
  }

  // ---- PostHog events (last N days) ----
  let posthogConfigured = isPostHogConfigured()
  if (posthogConfigured && customer?.email) {
    try {
      const hogql = `
        SELECT timestamp, event, properties
        FROM events
        WHERE distinct_id = '${String(customer.email).replace(/'/g, "''")}'
          AND timestamp > now() - interval ${days} day
        ORDER BY timestamp DESC
        LIMIT ${Math.min(limit, 500)}
      `
      const res = await fetch(`${hostBase()}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: { kind: "HogQLQuery", query: hogql } }),
      })
      if (res.ok) {
        const json = (await res.json()) as { results?: any[][] }
        for (const row of json.results ?? []) {
          const [timestamp, event, props] = row as [string, string, any]
          let detail: string | null = null
          if (props && typeof props === "object") {
            const path = (props as any).$current_url ?? (props as any).path ?? null
            if (path) detail = String(path)
          }
          events.push({
            source: "posthog",
            at: timestamp,
            title: event,
            detail,
            href: null,
          })
        }
      }
    } catch {
      // soft fail
    }
  }

  events.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
  return { events: events.slice(0, limit), posthog_configured: posthogConfigured }
}
