import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import type {
  IOrderModuleService,
} from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

import { FREE_SHIPPING_TAGS } from "../lib/constants"

/**
 * On `order.placed`, snapshot any tier-perks the customer was entitled
 * to at the moment of purchase onto `order.metadata.applied_perks`.
 * Staff use this to waive shipping at fulfillment without having to
 * re-check the customer's current tags (which can be edited after the
 * fact). Also useful for reporting on perk usage.
 *
 * Idempotent — skips when `applied_perks` already exists.
 */
export default async function stampOrderPerks({
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

  const meta = (order.metadata ?? {}) as Record<string, unknown>
  if (Array.isArray(meta.applied_perks)) {
    return
  }
  if (!order.customer_id) {
    return
  }

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: tags } = await query.graph({
      entity: "customer_tag",
      fields: ["label", "color"],
      filters: { customer_id: order.customer_id },
      pagination: { take: 200, skip: 0 },
    })
    const tagLabels = (tags as Array<{ label?: string }> | undefined)
      ?.map((t) => (typeof t.label === "string" ? t.label : ""))
      .filter((s) => s.length > 0) ?? []

    const perks: Array<{ perk: string; granted_by_tag: string }> = []
    for (const label of tagLabels) {
      if (FREE_SHIPPING_TAGS.includes(label.toLowerCase())) {
        perks.push({ perk: "free_shipping", granted_by_tag: label })
        break
      }
    }

    await orderModuleService.updateOrders(orderId, {
      metadata: {
        ...meta,
        applied_perks: perks,
        applied_perks_customer_tags_snapshot: tagLabels,
      },
    })
  } catch (err: any) {
    logger.warn(
      `stamp-order-perks: failed for order ${orderId}: ${err?.message ?? err}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
