import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

import { recomputeScpCartPricing } from "../lib/recompute-scp-cart-pricing"

/**
 * Cross-cart bulk-tier aggregation subscriber.
 *
 * Fires on every `cart.updated` event — emitted by every core line-item
 * workflow (add, update quantity, delete) — and recomputes the aggregated
 * tier across the cart. The recompute is idempotent (skips lines whose
 * price already matches), so when it runs after the SCP add-endpoint has
 * already done a synchronous recompute, it no-ops harmlessly.
 *
 * This is what catches the case where the customer changes line quantity
 * from the cart page (which uses Medusa's vanilla update-line-item
 * endpoint, not our SCP one) — the event fires, we re-aggregate, prices
 * stay correct.
 *
 * Loop-safe: our own `updateLineItemInCartWorkflow` calls inside
 * `recomputeScpCartPricing` will emit further `cart.updated` events, so
 * this subscriber re-fires. The second pass finds prices already aligned
 * and exits without writing → loop terminates.
 */
export default async function recomputeScpCartPricingOnChange({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const cartId = data?.id
  if (!cartId) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    await recomputeScpCartPricing(cartId, container)
  } catch (error) {
    // Aggregation is value-add — never let it crash other subscribers.
    logger.error(
      `recompute-scp-cart-pricing-on-change: failed for cart ${cartId}: ${
        (error as Error).message
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: "cart.updated",
}
