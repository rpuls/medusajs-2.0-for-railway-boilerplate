import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { runRulesForEvent } from "../services/automation-rules/evaluate"

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
