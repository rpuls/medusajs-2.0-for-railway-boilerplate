import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { IOrderModuleService } from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

import {
  isProductionStage,
  type ProductionStageHistoryEntry,
} from "../lib/production-stage"

/**
 * Stamps `production_stage = "received"` onto every newly placed order so the
 * customer's storefront tracker shows progress immediately. Without this, the
 * tracker section stays hidden until staff manually clicks the first stage in
 * the admin widget — looks broken on the customer's first visit to the order
 * page.
 *
 * Idempotent: skips if a stage is already set (e.g., re-fired event, replay).
 * Runs alongside `order-placed.ts` (emails) and
 * `order-placed-stamp-shipping-decision.ts` (decision bridge); each handler
 * does one focused thing.
 */
export default async function orderPlacedStampProductionStageHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data?.id
  if (!orderId) {
    return
  }

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId)
  } catch (error) {
    logger.error(
      `order.placed production-stage bridge: failed to retrieve order ${orderId}: ${
        (error as Error).message
      }`
    )
    return
  }

  const meta = (order.metadata ?? {}) as Record<string, unknown>
  if (isProductionStage(meta.production_stage)) {
    // Already stamped (admin set it manually before, or this event re-fired).
    return
  }

  const changedAt = new Date().toISOString()
  const initialEntry: ProductionStageHistoryEntry = {
    stage: "received",
    changed_at: changedAt,
    changed_by: "system",
    note: "Order received — auto-stamped at placement.",
  }

  try {
    await orderModuleService.updateOrders(orderId, {
      metadata: {
        ...meta,
        production_stage: "received",
        production_stage_changed_at: changedAt,
        production_stage_history: [initialEntry],
      },
    })
  } catch (error) {
    logger.error(
      `order.placed production-stage bridge: failed to stamp 'received' on order ${orderId}: ${
        (error as Error).message
      }`
    )
  }

  // Intentionally NOT emitting `order.production_stage_changed` here — the
  // "received" milestone doesn't fire a customer email (see STAGES_THAT_EMAIL),
  // and skipping the emit avoids a spurious event on every new order.
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
