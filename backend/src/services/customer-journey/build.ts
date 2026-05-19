import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  POSTHOG_HOST,
  POSTHOG_PERSONAL_API_KEY,
  POSTHOG_PROJECT_ID,
} from "../../lib/constants"

export type JourneyEvent = {
  source: "order" | "posthog" | "nps" | "tag" | "design" | "audit"
  at: string
  title: string
  detail?: string | null
  href?: string | null
}

/**
 * Phase 9: friendlier titles for the polymorphic `audit_log` rows that
 * land on the customer timeline. Each `action` constant from
 * `lib/audit-entities.ts` gets a short human label; anything we
 * haven't mapped falls back to the raw verb.
 */
const AUDIT_ACTION_LABEL: Record<string, string> = {
  created: "Account created",
  status_changed: "Status changed",
  owner_changed: "Owner changed",
  assigned: "Assigned",
  unassigned: "Unassigned",
  tag_added: "Tag added",
  tag_removed: "Tag removed",
  note_added: "Note added",
  note_pinned: "Note pinned",
  note_snoozed: "Note snoozed",
  note_deleted: "Note removed",
  comment_posted: "Comment posted",
  member_added: "Joined organisation",
  member_removed: "Left organisation",
  email_sent: "Email sent",
  email_opened: "Email opened",
  email_clicked: "Email clicked",
  email_bounced: "Email bounced",
  email_suppressed: "Unsubscribed",
  payment_link_clicked: "Payment link clicked",
  rule_fired: "Automation fired",
  expired: "Quote expired",
  converted: "Quote converted",
  stage_changed: "Production stage changed",
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
 *   - Customer tag changes (also surfaced via audit_log)
 *   - audit_log rows where `entity = "customer"` (Phase 9): owner
 *     changes, note add/pin/snooze, tag add/remove, organisation
 *     joins/leaves, marketing unsubscribes, etc.
 *
 * Each source is independently capped at 200 events so audit-log
 * spam (e.g. high-volume email open/click writes in later phases)
 * can't crowd out the orders/design history the staff actually need.
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

    // ---- audit_log rows (entity = "customer") — Phase 9 ----
    try {
      const { data: auditRows } = await query.graph({
        entity: "audit_log",
        fields: ["id", "action", "actor_id", "actor_email", "details", "created_at"],
        filters: { entity: "customer", entity_id: customer.id },
        pagination: { take: 200, skip: 0 },
      })
      for (const r of (auditRows as any[]) ?? []) {
        if (!r?.created_at) continue
        const action = String(r.action ?? "")
        const title = AUDIT_ACTION_LABEL[action] ?? action.replace(/_/g, " ")
        const actor = r.actor_email || r.actor_id || null
        // Best-effort detail extraction from the freeform `details` JSON.
        let detail: string | null = null
        const d = r.details as Record<string, unknown> | null | undefined
        if (d) {
          if (action === "tag_added" && typeof d.label === "string") {
            detail = `"${d.label}"${actor ? ` · by ${actor}` : ""}`
          } else if (action === "tag_removed" && typeof d.label === "string") {
            detail = `"${d.label}"${actor ? ` · by ${actor}` : ""}`
          } else if (action === "note_added" && typeof d.excerpt === "string") {
            detail = `${d.excerpt}${actor ? ` · by ${actor}` : ""}`
          } else if (action === "owner_changed" && typeof d.to_user_id === "string") {
            detail = `to ${d.to_user_id}${
              typeof d.from_user_id === "string" ? ` (was ${d.from_user_id})` : ""
            }`
          } else if (action === "member_added" && typeof d.organisation_id === "string") {
            detail = `org ${d.organisation_id}${
              typeof d.role === "string" ? ` · ${d.role}` : ""
            }`
          } else if (action === "email_suppressed") {
            const kind = (d as any).template_kind
            detail = kind ? `Unsubscribed (${kind})` : "Unsubscribed (all marketing)"
          } else if (actor) {
            detail = `by ${actor}`
          }
        } else if (actor) {
          detail = `by ${actor}`
        }
        events.push({
          source: "audit",
          at: r.created_at as string,
          title,
          detail,
          href: null,
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
