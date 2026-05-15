import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

import { markAbandonedCartConverted } from "../services/abandoned-cart-reminders/mark-converted"

/**
 * On `order.placed`, stamp `converted_at` on any pending
 * abandoned-cart-followup rows tied to the same email so the cron stops
 * pinging this customer about a cart that's already become an order.
 *
 * Idempotent — runs on every order.placed but only updates rows where
 * `converted_at IS NULL`.
 */
export default async function abandonedCartMarkConverted({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data?.id
  if (!orderId) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId)
  } catch {
    return
  }

  try {
    await markAbandonedCartConverted({ email: order?.email })
  } catch (err: any) {
    logger.warn(
      `abandoned-cart-mark-converted: failed for order ${orderId}: ${err?.message ?? err}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
