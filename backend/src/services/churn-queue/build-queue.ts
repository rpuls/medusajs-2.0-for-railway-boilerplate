import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"

/**
 * Builds the predicted-churn win-back queue. Anchored on RFM-style scoring
 * + days-overdue past the customer's typical reorder cadence.
 *
 * A customer enters the queue when ALL of the following hold:
 *   - 2+ non-cancelled orders (need a baseline cadence)
 *   - days_since_last > median_gap × 2 (clearly past their typical return)
 *   - days_since_last < 540 (3× a year is far enough that they're "lost",
 *     not "drifting" — mass-discount lost customers, don't waste win-back)
 *   - No win-back email sent in the last 90 days
 *
 * Severity classification (used for subject-line + offer tier):
 *   - "drifting"   median × 2 ≤ days_since < median × 3
 *   - "at_risk"    median × 3 ≤ days_since < median × 5
 *   - "lost"       median × 5 ≤ days_since (still under 540 floor)
 */

export type ChurnSeverity = "drifting" | "at_risk" | "lost"

export type ChurnCandidate = {
  customer_id: string | null
  email: string
  first_name: string | null
  order_count: number
  last_order_id: string
  last_order_display_id: number | null
  last_order_at: string
  last_order_total: number
  median_gap_days: number
  days_since_last: number
  overdue_factor: number
  lifetime_revenue: number
  severity: ChurnSeverity
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

const classifySeverity = (overdueFactor: number): ChurnSeverity => {
  if (overdueFactor >= 5) return "lost"
  if (overdueFactor >= 3) return "at_risk"
  return "drifting"
}

export async function buildChurnQueue(
  container: MedusaContainer,
  options: { now?: Date } = {}
): Promise<ChurnCandidate[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const now = options.now ?? new Date()

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
    ],
    pagination: { take: 5000, skip: 0 },
  })

  type CustomerAgg = {
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
    }>
  }
  const byCustomer = new Map<string, CustomerAgg>()

  for (const o of (orders as any[]) ?? []) {
    if (o?.status === "canceled") continue
    const created = Date.parse(o?.created_at ?? "")
    if (!Number.isFinite(created)) continue
    if (created > now.getTime()) continue
    if (typeof o.email !== "string" || o.email.length === 0) continue
    const key = (o.customer_id as string) || (o.email as string)
    if (!key) continue

    const entry = {
      id: o.id as string,
      display_id: typeof o.display_id === "number" ? o.display_id : null,
      created_at: created,
      total: Number(o.total ?? 0),
    }
    const existing = byCustomer.get(key)
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
      if (!existing.first_name && o.shipping_address?.first_name) {
        existing.first_name = o.shipping_address.first_name as string
      }
      if (!existing.country_code && o.shipping_address?.country_code) {
        existing.country_code = (o.shipping_address.country_code as string)
          .toLowerCase()
      }
    }
  }

  // ---- Pull last_winback_sent_at + marketing_consent_email off customer metadata ----
  const customerIds = Array.from(byCustomer.values())
    .map((c) => c.customer_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0)
  const lastWinbackByCustomer = new Map<string, number>()
  const optedOutCustomers = new Set<string>()
  if (customerIds.length > 0) {
    try {
      const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "metadata"],
        filters: { id: customerIds },
        pagination: { take: customerIds.length, skip: 0 },
      })
      for (const c of (customers as any[]) ?? []) {
        const meta = (c?.metadata as Record<string, unknown> | undefined) ?? {}
        const ts = meta.last_winback_sent_at
        if (typeof ts === "string") {
          const ms = Date.parse(ts)
          if (Number.isFinite(ms)) lastWinbackByCustomer.set(c.id, ms)
        }
        if (meta.marketing_consent_email === false) {
          optedOutCustomers.add(c.id)
        }
      }
    } catch {
      // Treat as never-sent.
    }
  }

  const candidates: ChurnCandidate[] = []
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
    if (medianGap < 14) continue // Tiny cadence means churn signal is too noisy.

    const last = c.orders[c.orders.length - 1]
    const daysSinceLast = (now.getTime() - last.created_at) / 86_400_000
    if (daysSinceLast > 540) continue // Far gone — skip win-back, not the right campaign.
    const overdueFactor = daysSinceLast / Math.max(medianGap, 1)
    if (overdueFactor < 2) continue

    if (c.customer_id) {
      if (optedOutCustomers.has(c.customer_id)) continue
      const lastWinback = lastWinbackByCustomer.get(c.customer_id)
      if (lastWinback != null) {
        const daysSinceWinback = (now.getTime() - lastWinback) / 86_400_000
        if (daysSinceWinback < 90) continue
      }
    }

    const lifetimeRevenue = c.orders.reduce((s, o) => s + o.total, 0)

    candidates.push({
      customer_id: c.customer_id,
      email: c.email,
      first_name: c.first_name,
      order_count: c.orders.length,
      last_order_id: last.id,
      last_order_display_id: last.display_id,
      last_order_at: new Date(last.created_at).toISOString(),
      last_order_total: Math.round(last.total * 100) / 100,
      median_gap_days: Math.round(medianGap * 10) / 10,
      days_since_last: Math.round(daysSinceLast * 10) / 10,
      overdue_factor: Math.round(overdueFactor * 10) / 10,
      lifetime_revenue: Math.round(lifetimeRevenue * 100) / 100,
      severity: classifySeverity(overdueFactor),
      country_code: c.country_code,
      currency_code: c.currency_code.toUpperCase(),
    })
  }

  // Sort by lifetime revenue desc — highest-value churners first so a
  // capped batch hits the most worthwhile inboxes.
  candidates.sort((a, b) => b.lifetime_revenue - a.lifetime_revenue)

  return candidates
}
