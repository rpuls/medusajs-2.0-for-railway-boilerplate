import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { computeCustomerLtv, type LtvSummary } from "./compute-ltv"

/**
 * Container-aware wrapper around `computeCustomerLtv`. Fetches the
 * customer's non-cancelled orders via `query.graph` and applies the
 * pure aggregator. No caching — call sites that need it can wrap.
 */
export async function getCustomerLtv(
  container: MedusaContainer,
  customerId: string,
  options: { now?: Date } = {}
): Promise<LtvSummary> {
  if (!customerId) {
    return computeCustomerLtv([], options)
  }
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "total", "currency_code", "status", "created_at"],
    filters: { customer_id: customerId },
    pagination: { take: 5000, skip: 0 },
  })

  return computeCustomerLtv(
    ((orders as any[]) ?? []).map((o) => ({
      total: o?.total,
      currency_code: o?.currency_code,
      status: o?.status,
      created_at: o?.created_at,
    })),
    options
  )
}
