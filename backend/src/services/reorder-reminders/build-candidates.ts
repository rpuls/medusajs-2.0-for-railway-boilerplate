import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"

/**
 * Identifies customers who are around their typical reorder cadence and
 * haven't been pinged about it recently. Pure read — no side effects, no
 * email send. Pair with `send-reminders.ts` to actually fire emails.
 *
 * Algorithm per customer:
 *   1. Pull their non-cancelled orders, sorted by created_at asc.
 *   2. Need at least 2 orders to have a gap to median over.
 *   3. Compute median_gap = median of consecutive `created_at` deltas.
 *      We use median (not mean) because one big delivery delay shouldn't
 *      shift the cadence prediction.
 *   4. days_since_last = now - last_order_at.
 *   5. Trigger when days_since_last is in [median_gap, median_gap * 1.5].
 *      Below median = too early to nudge. Above 1.5× = they're at-risk
 *      / lost (different campaign — handled by RFM-driven flow later).
 *   6. Skip if `customer.metadata.last_reorder_reminder_sent_at` is set
 *      and is < median_gap days ago — don't double-nudge.
 *
 * Single-region storefront: no per-region scoping needed. If/when AU
 * isn't the only region we'd partition by `region_id`.
 */

export type ReorderCandidate = {
  customer_id: string | null
  email: string
  first_name: string | null
  last_order_id: string
  last_order_display_id: number | null
  last_order_at: string
  last_order_total: number
  median_gap_days: number
  days_since_last: number
  order_count: number
  /** ISO of any line item in the last order that has a customizer
   *  metadata payload, surfaced so the email's "Re-order" link can
   *  deep-link straight into the customizer with the original artwork. */
  reorder_line_item_id: string | null
  country_code: string | null
  currency_code: string
}

const median = (values: number[]): number => {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

const itemHasCustomizer = (item: any): boolean => {
  const meta = item?.metadata
  if (!meta || typeof meta !== "object") return false
  if (meta.customizerDesign && typeof meta.customizerDesign === "object")
    return true
  if (meta.decorationDesign && typeof meta.decorationDesign === "object")
    return true
  return false
}

export async function buildReorderCandidates(
  container: MedusaContainer,
  options: { now?: Date; minMedianGapDays?: number; maxMedianGapDays?: number } = {}
): Promise<ReorderCandidate[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const now = options.now ?? new Date()
  // Floors / ceilings to avoid noise:
  //  - 14 days minimum so we don't hammer customers who happened to
  //    place 2 orders in the same week (often fixing an artwork mistake
  //    on their first order).
  //  - 365 days maximum so an annual ordering pattern doesn't keep us
  //    nudging years later — that's the lost-customer flow's job.
  const minGap = options.minMedianGapDays ?? 14
  const maxGap = options.maxMedianGapDays ?? 365

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "created_at",
      "status",
      "total",
      "currency_code",
      "email",
      "customer_id",
      "shipping_address.first_name",
      "shipping_address.country_code",
      "items.id",
      "items.metadata",
    ],
    pagination: { take: 5000, skip: 0 },
  })

  type CustomerOrders = {
    key: string
    customer_id: string | null
    email: string
    first_name: string | null
    country_code: string | null
    currency_code: string
    orders: Array<{
      id: string
      display_id: number | null
      created_at: number
      total: number
      reorder_line_item_id: string | null
    }>
  }
  const byCustomer = new Map<string, CustomerOrders>()

  for (const o of (orders as any[]) ?? []) {
    if (o?.status === "canceled") continue
    const created = Date.parse(o?.created_at ?? "")
    if (!Number.isFinite(created)) continue
    if (created > now.getTime()) continue
    if (typeof o.email !== "string" || o.email.length === 0) continue
    const key = (o.customer_id as string) || (o.email as string)
    if (!key) continue

    const reorderLine =
      ((o.items ?? []) as any[]).find(itemHasCustomizer)?.id ?? null

    const existing = byCustomer.get(key)
    const entry = {
      id: o.id as string,
      display_id: typeof o.display_id === "number" ? o.display_id : null,
      created_at: created,
      total: Number(o.total ?? 0),
      reorder_line_item_id:
        typeof reorderLine === "string" ? reorderLine : null,
    }
    if (!existing) {
      byCustomer.set(key, {
        key,
        customer_id: typeof o.customer_id === "string" ? o.customer_id : null,
        email: o.email,
        first_name:
          typeof o.shipping_address?.first_name === "string"
            ? o.shipping_address.first_name
            : null,
        country_code:
          typeof o.shipping_address?.country_code === "string"
            ? o.shipping_address.country_code.toLowerCase()
            : null,
        currency_code:
          typeof o.currency_code === "string" ? o.currency_code : "AUD",
        orders: [entry],
      })
    } else {
      existing.orders.push(entry)
      // Keep first_name from any order that has it; some guest orders may
      // miss the shipping_address relation in this graph.
      if (!existing.first_name && o.shipping_address?.first_name) {
        existing.first_name = o.shipping_address.first_name as string
      }
      if (!existing.country_code && o.shipping_address?.country_code) {
        existing.country_code = (o.shipping_address.country_code as string)
          .toLowerCase()
      }
    }
  }

  // ---- Pull last_reorder_reminder_sent_at off customer metadata ------
  const customerIds = Array.from(byCustomer.values())
    .map((c) => c.customer_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0)
  const lastSentByCustomer = new Map<string, number>()
  if (customerIds.length > 0) {
    try {
      const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "metadata"],
        filters: { id: customerIds },
        pagination: { take: customerIds.length, skip: 0 },
      })
      for (const c of (customers as any[]) ?? []) {
        const ts = (c?.metadata as any)?.last_reorder_reminder_sent_at
        if (typeof ts === "string") {
          const ms = Date.parse(ts)
          if (Number.isFinite(ms)) lastSentByCustomer.set(c.id, ms)
        }
      }
    } catch {
      // Non-fatal; treat as never-sent-before.
    }
  }

  // ---- Score each customer -------------------------------------------
  const candidates: ReorderCandidate[] = []
  for (const c of byCustomer.values()) {
    if (c.orders.length < 2) continue
    c.orders.sort((a, b) => a.created_at - b.created_at)
    const gaps: number[] = []
    for (let i = 1; i < c.orders.length; i++) {
      gaps.push(
        (c.orders[i].created_at - c.orders[i - 1].created_at) / 86_400_000
      )
    }
    const medianGap = median(gaps)
    if (medianGap < minGap || medianGap > maxGap) continue
    const last = c.orders[c.orders.length - 1]
    const daysSinceLast = (now.getTime() - last.created_at) / 86_400_000
    if (daysSinceLast < medianGap) continue
    if (daysSinceLast > medianGap * 1.5) continue

    if (c.customer_id) {
      const lastSent = lastSentByCustomer.get(c.customer_id)
      if (lastSent != null) {
        const daysSinceReminder = (now.getTime() - lastSent) / 86_400_000
        if (daysSinceReminder < medianGap) continue
      }
    }

    candidates.push({
      customer_id: c.customer_id,
      email: c.email,
      first_name: c.first_name,
      last_order_id: last.id,
      last_order_display_id: last.display_id,
      last_order_at: new Date(last.created_at).toISOString(),
      last_order_total: Math.round(last.total * 100) / 100,
      median_gap_days: Math.round(medianGap * 10) / 10,
      days_since_last: Math.round(daysSinceLast * 10) / 10,
      order_count: c.orders.length,
      reorder_line_item_id: last.reorder_line_item_id,
      country_code: c.country_code,
      currency_code: c.currency_code.toUpperCase(),
    })
  }

  // Most overdue first (longest days_since_last - median_gap), so if the
  // batch run hits a rate limit the most pressing reminders get out
  // first.
  candidates.sort(
    (a, b) =>
      b.days_since_last - b.median_gap_days -
      (a.days_since_last - a.median_gap_days)
  )

  return candidates
}
