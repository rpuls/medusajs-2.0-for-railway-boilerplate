import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

import { OWNER_AUTOSTAMP_ENABLED } from "../lib/constants"
import {
  getOwner,
  pickNextOwner,
  setOwner,
} from "../lib/crm-owners"
import { AUDIT_ENTITY } from "../lib/audit-entities"

/**
 * On `order.placed`, stamp the order's owner from one of:
 *   1. The customer's existing owner (preferred — keeps each
 *      customer's orders with one staff member)
 *   2. The next user from the rotation table (when the customer is
 *      un-owned, e.g. a new signup)
 *   3. No-op if rotation is empty
 *
 * Gated by `OWNER_AUTOSTAMP_ENABLED=true`. Idempotent — if the order
 * already has an owner (e.g. set by a Phase 10 automation rule before
 * this subscriber runs) the existing owner is preserved.
 */
export default async function orderPlacedStampOwnerHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  if (!OWNER_AUTOSTAMP_ENABLED) return
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderId = data?.id
  if (!orderId) return

  // 1) Don't overwrite an existing owner.
  const existing = await getOwner({
    container,
    entity: AUDIT_ENTITY.ORDER,
    entity_id: orderId,
  })
  if (existing) return

  // 2) Look up the customer behind the order.
  let customerId: string | null = null
  try {
    const orderService = container.resolve(Modules.ORDER) as any
    const order = await orderService.retrieveOrder(orderId)
    customerId =
      typeof order?.customer_id === "string" ? order.customer_id : null
  } catch (err: any) {
    logger.warn(
      `order-placed-stamp-owner: order lookup failed for ${orderId}: ${err?.message ?? err}`
    )
    return
  }

  // 3) Inherit from customer owner if present.
  if (customerId) {
    const custOwner = await getOwner({
      container,
      entity: AUDIT_ENTITY.CUSTOMER,
      entity_id: customerId,
    })
    if (custOwner?.user_id) {
      await setOwner({
        container,
        entity: AUDIT_ENTITY.ORDER,
        entity_id: orderId,
        user_id: custOwner.user_id,
        actor: "system",
        reason: "inherited_from_customer",
      })
      return
    }
  }

  // 4) Fall back to rotation. Also stamp the customer so future orders
  // inherit consistently.
  const next = await pickNextOwner({ container })
  if (!next) return
  await setOwner({
    container,
    entity: AUDIT_ENTITY.ORDER,
    entity_id: orderId,
    user_id: next.user_id,
    actor: "system",
    reason: "rotation_pick",
  })
  if (customerId) {
    await setOwner({
      container,
      entity: AUDIT_ENTITY.CUSTOMER,
      entity_id: customerId,
      user_id: next.user_id,
      actor: "system",
      reason: "rotation_pick_from_order",
    })
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
