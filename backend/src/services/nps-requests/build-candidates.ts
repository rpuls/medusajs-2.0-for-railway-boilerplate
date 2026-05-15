import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  NPS_MIN_GAP_DAYS_PER_CUSTOMER,
  NPS_REQUEST_DAYS_AFTER_DELIVERED,
} from "../../lib/constants"

export type NpsCandidate = {
  order_id: string
  order_display_id: number | null
  email: string
  first_name: string | null
  customer_id: string | null
  delivered_at: string
  country_code: string | null
}

/**
 * Builds the queue of orders that should receive an NPS request.
 *
 * Picks orders where:
 *   - `metadata.production_stage = "delivered"`
 *   - `metadata.production_stage_changed_at` is at least
 *     `NPS_REQUEST_DAYS_AFTER_DELIVERED` days ago
 *   - `metadata.nps_request_sent_at` is unset (per-order idempotency)
 *   - the customer (if any) has `marketing_consent_email !== false`
 *     and `last_nps_request_sent_at` is unset or older than
 *     `NPS_MIN_GAP_DAYS_PER_CUSTOMER`
 *
 * Pure read — no side effects. Pair with `send-requests.ts`.
 */
export async function buildNpsCandidates(
  container: MedusaContainer,
  options: { now?: Date } = {}
): Promise<NpsCandidate[]> {
  const now = options.now ?? new Date()
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const cutoffMs =
    now.getTime() - NPS_REQUEST_DAYS_AFTER_DELIVERED * 24 * 60 * 60 * 1000

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "customer_id",
      "metadata",
      "status",
      "shipping_address.first_name",
      "shipping_address.country_code",
    ],
    pagination: { take: 5000, skip: 0 },
  })

  const eligibleOrders = ((orders as any[]) ?? []).flatMap((o) => {
    if (!o) return []
    if ((o.status ?? "").toLowerCase() === "canceled") return []
    if (typeof o.email !== "string" || o.email.length === 0) return []
    const meta = (o.metadata as Record<string, unknown> | undefined) ?? {}
    if (meta.production_stage !== "delivered") return []
    if (meta.nps_request_sent_at) return []
    const deliveredAt = meta.production_stage_changed_at
    if (typeof deliveredAt !== "string") return []
    const deliveredMs = Date.parse(deliveredAt)
    if (!Number.isFinite(deliveredMs)) return []
    if (deliveredMs > cutoffMs) return []
    return [
      {
        order_id: o.id as string,
        order_display_id:
          typeof o.display_id === "number" ? o.display_id : null,
        email: (o.email as string).toLowerCase(),
        first_name:
          typeof o.shipping_address?.first_name === "string"
            ? (o.shipping_address.first_name as string)
            : null,
        customer_id: typeof o.customer_id === "string" ? o.customer_id : null,
        delivered_at: deliveredAt,
        country_code:
          typeof o.shipping_address?.country_code === "string"
            ? (o.shipping_address.country_code as string).toLowerCase()
            : null,
      } satisfies NpsCandidate,
    ]
  })

  if (eligibleOrders.length === 0) return []

  // ---- Filter by customer consent + gap ----
  const customerIds = Array.from(
    new Set(
      eligibleOrders
        .map((c) => c.customer_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    )
  )
  const customerMeta = new Map<string, Record<string, unknown>>()
  if (customerIds.length > 0) {
    try {
      const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "metadata"],
        filters: { id: customerIds },
        pagination: { take: customerIds.length, skip: 0 },
      })
      for (const c of (customers as any[]) ?? []) {
        customerMeta.set(c.id as string, (c.metadata ?? {}) as Record<string, unknown>)
      }
    } catch {
      // treat as no metadata — order still eligible
    }
  }

  const gapMs = NPS_MIN_GAP_DAYS_PER_CUSTOMER * 24 * 60 * 60 * 1000
  return eligibleOrders.filter((candidate) => {
    if (!candidate.customer_id) return true
    const meta = customerMeta.get(candidate.customer_id) ?? {}
    if (meta.marketing_consent_email === false) return false
    const lastNps = meta.last_nps_request_sent_at
    if (typeof lastNps === "string") {
      const ms = Date.parse(lastNps)
      if (Number.isFinite(ms) && now.getTime() - ms < gapMs) return false
    }
    return true
  })
}
