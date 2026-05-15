import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { runRulesForEvent } from "../services/automation-rules/evaluate"
import { getCustomerLtv } from "../services/customer-ltv/get-ltv"

/**
 * Fires every automation rule with trigger_event = "order.placed".
 *
 * Hydrates the order so rule conditions can reference fields like
 * `order.total`, `order.email`, line item methods, etc.
 */
export default async function automationOnOrderPlaced({
  event,
  container,
}: SubscriberArgs<any>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderId = event?.data?.id ?? event?.data?.order_id
  if (!orderId) return
  const orderModuleService = container.resolve(Modules.ORDER) as any
  let order: any = null
  try {
    order = await orderModuleService.retrieveOrder(orderId)
  } catch {
    return
  }
  let lifetime_value = 0
  let order_count = 0
  if (order?.customer_id) {
    try {
      const ltv = await getCustomerLtv(container, order.customer_id)
      lifetime_value = ltv.lifetime_value
      order_count = ltv.order_count
    } catch (err: any) {
      logger.warn(
        `automation:order.placed: ltv lookup failed for ${order.customer_id}: ${err?.message ?? err}`
      )
    }
  }

  const payload = {
    order_id: orderId,
    customer_id: order?.customer_id ?? null,
    email: order?.email ?? null,
    total: Number(order?.total ?? 0),
    currency_code: order?.currency_code ?? null,
    line_count: Array.isArray(order?.items) ? order.items.length : 0,
    quantity_total: Array.isArray(order?.items)
      ? order.items.reduce(
          (s: number, it: any) => s + Number(it?.quantity ?? 0),
          0
        )
      : 0,
    lifetime_value,
    order_count,
  }
  try {
    const result = await runRulesForEvent(container, "order.placed", payload)
    if (result.fired > 0) {
      logger.info(
        `automation:order.placed: fired ${result.fired}/${result.evaluated} rules (${result.failures} action failures)`
      )
    }
  } catch (err: any) {
    logger.warn(`automation:order.placed: ${err?.message ?? err}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
