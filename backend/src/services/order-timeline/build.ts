import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export type TimelineEntry = {
  type:
    | "created"
    | "stage_change"
    | "photo_added"
    | "reject_logged"
    | "comment"
    | "nps_sent"
    | "nps_response"
    | "tax_exempt_stamped"
    | "watcher_added"
  at: string
  actor: string | null
  /** Short headline rendered as the row title. */
  title: string
  /** Optional secondary text. */
  detail?: string | null
  /** Optional thumbnail URL (e.g. production photo). */
  thumbnail_url?: string | null
}

/**
 * Aggregates every signal we capture about an order into a single
 * chronological feed for the admin order detail page. Pulls from:
 *   - order created / status changes (from order itself)
 *   - production_stage_history (from order.metadata)
 *   - production_photos (from order.metadata)
 *   - production_reject rows
 *   - order_comment rows
 *   - NPS metadata
 *
 * No DB writes. Called from the admin timeline route.
 */
export async function buildOrderTimeline(
  container: MedusaContainer,
  orderId: string
): Promise<TimelineEntry[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const entries: TimelineEntry[] = []

  // ---- Pull the order ----
  let order: any = null
  try {
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "display_id", "metadata", "created_at", "email"],
      filters: { id: orderId },
    })
    order = (data as any[])?.[0]
  } catch {
    return []
  }
  if (!order) return []

  if (order.created_at) {
    entries.push({
      type: "created",
      at: order.created_at,
      actor: null,
      title: "Order placed",
      detail: order.email ?? null,
    })
  }

  const meta = (order.metadata ?? {}) as Record<string, unknown>

  // Stage history
  const history = Array.isArray(meta.production_stage_history)
    ? (meta.production_stage_history as Array<{
        stage?: string
        changed_at?: string
        changed_by?: string | null
        note?: string | null
        track?: string | null
      }>)
    : []
  for (const h of history) {
    if (!h?.stage || !h.changed_at) continue
    entries.push({
      type: "stage_change",
      at: h.changed_at,
      actor: h.changed_by ?? null,
      title: `Stage → ${h.stage}`,
      detail: h.note ?? (h.track ? `track: ${h.track}` : null),
    })
  }

  // Photos
  const photos = Array.isArray(meta.production_photos)
    ? (meta.production_photos as Array<{
        url?: string
        caption?: string | null
        uploaded_at?: string
        uploaded_by?: string | null
      }>)
    : []
  for (const p of photos) {
    if (!p?.uploaded_at || !p?.url) continue
    entries.push({
      type: "photo_added",
      at: p.uploaded_at,
      actor: p.uploaded_by ?? null,
      title: "Production photo uploaded",
      detail: p.caption ?? null,
      thumbnail_url: p.url,
    })
  }

  // NPS request sent + response captured
  if (typeof meta.nps_request_sent_at === "string") {
    entries.push({
      type: "nps_sent",
      at: meta.nps_request_sent_at,
      actor: "system",
      title: "NPS request sent",
      detail: null,
    })
  }
  if (typeof meta.nps_recorded_at === "string") {
    const score =
      typeof meta.nps_score === "number" ? `${meta.nps_score}/5` : "rated"
    entries.push({
      type: "nps_response",
      at: meta.nps_recorded_at,
      actor: order.email ?? null,
      title: `NPS response — ${score}`,
      detail:
        typeof meta.nps_comment === "string" ? (meta.nps_comment as string) : null,
    })
  }

  if (meta.tax_exempt === true) {
    entries.push({
      type: "tax_exempt_stamped",
      at: order.created_at ?? new Date(0).toISOString(),
      actor: "system",
      title: "Tax-exempt snapshot applied",
      detail:
        typeof meta.tax_exempt_reason === "string"
          ? (meta.tax_exempt_reason as string)
          : null,
    })
  }

  // Order comments
  try {
    const { data: comments } = await query.graph({
      entity: "order_comment",
      fields: ["id", "body", "created_by", "created_at"],
      filters: { order_id: orderId },
      pagination: { take: 500, skip: 0 },
    })
    for (const c of (comments as any[]) ?? []) {
      if (!c?.created_at) continue
      entries.push({
        type: "comment",
        at: c.created_at,
        actor: c.created_by ?? null,
        title: "Staff comment",
        detail: c.body ?? null,
      })
    }
  } catch {
    // optional — schema may not be present in older deploys
  }

  // Rejects
  try {
    const { data: rejects } = await query.graph({
      entity: "production_reject",
      fields: ["id", "qty", "reason", "notes", "logged_by", "created_at"],
      filters: { order_id: orderId },
      pagination: { take: 500, skip: 0 },
    })
    for (const r of (rejects as any[]) ?? []) {
      if (!r?.created_at) continue
      entries.push({
        type: "reject_logged",
        at: r.created_at,
        actor: r.logged_by ?? null,
        title: `Reject logged — ${r.reason ?? "other"}`,
        detail: `${r.qty} unit(s)${r.notes ? ` · ${r.notes}` : ""}`,
      })
    }
  } catch {
    // optional
  }

  // Sort newest first.
  entries.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
  return entries
}
