import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { LTV_VIP_THRESHOLD_AUD } from "../../../../../lib/constants"
import { getCustomerLtv } from "../../../../../services/customer-ltv/get-ltv"

/**
 * GET /admin/customers/:id/ltv
 *   → { lifetime_value, currency_code, order_count, average_order_value,
 *       first_order_at, last_order_at, days_since_last, mixed_currency_truncated,
 *       vip_threshold, vip_suggested }
 *
 * vip_suggested = lifetime_value ≥ LTV_VIP_THRESHOLD_AUD AND the customer
 * has no `customer_tag` with label matching "vip" (case-insensitive).
 *
 * Live aggregation — no caching. Re-run on every widget mount; if it
 * becomes a perf problem, drop a 5-minute LRU here.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.params.id
  if (!customerId) {
    return res.status(400).json({ error: "id required" })
  }

  const ltv = await getCustomerLtv(req.scope, customerId)

  let hasVipTag = false
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: tags } = await query.graph({
      entity: "customer_tag",
      fields: ["id", "label"],
      filters: { customer_id: customerId },
      pagination: { take: 200, skip: 0 },
    })
    hasVipTag = (tags as Array<{ label?: string }> | undefined)?.some(
      (t) => typeof t.label === "string" && t.label.trim().toLowerCase() === "vip"
    ) ?? false
  } catch {
    hasVipTag = false
  }

  const vipSuggested = ltv.lifetime_value >= LTV_VIP_THRESHOLD_AUD && !hasVipTag

  return res.json({
    ...ltv,
    vip_threshold: LTV_VIP_THRESHOLD_AUD,
    vip_suggested: vipSuggested,
  })
}
