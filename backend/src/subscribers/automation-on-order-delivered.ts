import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

import { AUTOMATION_EXPANDED_TRIGGERS_ENABLED } from "../lib/constants"
import {
  PRODUCTION_STAGE_EVENT,
  type ProductionStageChangedEvent,
} from "../lib/production-stage"
import { runRulesForEvent } from "../services/automation-rules/evaluate"

/**
 * Phase 10 — listens on the existing PRODUCTION_STAGE_EVENT but only
 * fires for `to_stage === "delivered"`. Hydrates the same lifetime
 * value + order count fields as automation-on-order-placed so
 * conditions feel consistent between triggers.
 */
export default async function automationOnOrderDelivered({
  event: { data },
  container,
}: SubscriberArgs<ProductionStageChangedEvent>) {
  if (!AUTOMATION_EXPANDED_TRIGGERS_ENABLED) return
  if (data?.to_stage !== "delivered") return
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderId = data?.order_id
  if (!orderId) return

  let order: any = null
  try {
    const orderModule = container.resolve(Modules.ORDER) as any
    order = await orderModule.retrieveOrder(orderId)
  } catch (err: any) {
    logger.warn(
      `automation-on-order-delivered: retrieve failed for ${orderId}: ${err?.message ?? err}`
    )
    return
  }

  // Best-effort LTV + order count from a quick aggregate on the
  // customer's order history. Mirrors automation-on-order-placed.
  let lifetimeValue = 0
  let orderCount = 0
  const customerId = order?.customer_id ?? null
  if (customerId) {
    try {
      const query = container.resolve(ContainerRegistrationKeys.QUERY) as any
      const { data: rows } = await query.graph({
        entity: "order",
        fields: ["id", "total", "status"],
        filters: { customer_id: customerId },
        pagination: { take: 1000 },
      })
      for (const r of (rows as any[]) ?? []) {
        if (r.status === "cancelled") continue
        orderCount += 1
        const t = Number.parseFloat(String(r.total ?? "0"))
        if (Number.isFinite(t)) lifetimeValue += t
      }
    } catch {
      /* soft fail — conditions on these fields just won't match */
    }
  }

  const payload = {
    order_id: orderId,
    customer_id: customerId,
    total: Number.parseFloat(String(order?.total ?? "0")) || 0,
    currency_code: order?.currency_code ?? null,
    from_stage: data.from_stage,
    to_stage: data.to_stage,
    changed_at: data.changed_at,
    changed_by: data.changed_by,
    lifetime_value: lifetimeValue,
    order_count: orderCount,
  }

  await runRulesForEvent(container, "order.delivered", payload)
}

export const config: SubscriberConfig = {
  event: PRODUCTION_STAGE_EVENT,
}
