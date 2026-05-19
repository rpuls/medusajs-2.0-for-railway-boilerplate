import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

import { QUOTE_CONVERSION_ENABLED } from "../lib/constants"
import { QUOTE_MODULE } from "../modules/quote"
import { writeAudit } from "../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../lib/audit-entities"
import { captureEvent } from "../lib/posthog"

/**
 * Phase 11. When an order lands that originated from an accepted
 * quote, close the loop:
 *   1. Stamp `quote.metadata.order_id` so the quote points back at the
 *      resulting order
 *   2. If the quote is somehow still `quoted` (e.g. cart created via
 *      a route that didn't transition through the accept flow), move
 *      it to `accepted` with `accepted_at = now`
 *   3. Append a `QuoteEvent` (type: status_changed, body: { converted })
 *   4. Write `audit_log` rows (entity=quote, action=converted)
 *
 * Quote correlation:
 *   The quote-accept route at `backend/src/api/store/quotes/[id]/accept`
 *   stamps `cart.metadata.quote_id` AND `quote.metadata.cart_id`. We
 *   look up the cart via the order's `cart_id` (Medusa 2.x exposes
 *   it on the order entity), then read its `metadata.quote_id`.
 *
 * Idempotent — re-firing the subscriber after a successful run is a
 * no-op because `metadata.order_id` is already set.
 *
 * Gated by `QUOTE_CONVERSION_ENABLED=true` (default true — the loop-
 * closure is desired in production).
 */
export default async function quoteOnOrderPlaced({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  if (!QUOTE_CONVERSION_ENABLED) return
  const orderId = data?.id
  if (!orderId) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderService = container.resolve(Modules.ORDER) as any
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any

  let order: any
  try {
    order = await orderService.retrieveOrder(orderId)
  } catch {
    return
  }

  // Pull the cart's metadata via a graph query. The order has a
  // `cart_id` foreign-ish field; if Medusa changes the shape we fall
  // back to scanning the order's own metadata for an inherited
  // `quote_id` (some flows propagate cart metadata onto the order).
  let quoteId: string | null = null
  const orderMeta = (order?.metadata ?? {}) as Record<string, unknown>
  if (typeof orderMeta.quote_id === "string") {
    quoteId = orderMeta.quote_id
  }

  if (!quoteId) {
    const cartId =
      typeof order?.cart_id === "string" ? order.cart_id : null
    if (cartId) {
      try {
        const { data: carts } = await query.graph({
          entity: "cart",
          fields: ["id", "metadata"],
          filters: { id: cartId },
          pagination: { take: 1 },
        })
        const cart = (carts as any[])?.[0]
        const cartMeta = (cart?.metadata ?? {}) as Record<string, unknown>
        if (typeof cartMeta.quote_id === "string") {
          quoteId = cartMeta.quote_id
        }
      } catch {
        /* soft fail */
      }
    }
  }

  if (!quoteId) return // not a quote-derived order

  const quoteService = container.resolve(QUOTE_MODULE) as any
  let quote: any
  try {
    quote = await quoteService.retrieveQuote(quoteId)
  } catch {
    logger.warn(
      `quote-on-order-placed: quote ${quoteId} not found for order ${orderId}`
    )
    return
  }

  const quoteMeta = (quote.metadata ?? {}) as Record<string, unknown>
  // Idempotency: if the quote is already stamped with this order_id,
  // we've already run for this pair.
  if (quoteMeta.order_id === orderId) return

  const fromStatus = String(quote.status ?? "")
  const update: Record<string, unknown> = {
    id: quoteId,
    metadata: { ...quoteMeta, order_id: orderId },
  }
  if (fromStatus !== "accepted") {
    update.status = "accepted"
    update.accepted_at = new Date()
  }

  try {
    await quoteService.updateQuotes([update])
  } catch (err: any) {
    logger.warn(
      `quote-on-order-placed: update failed for quote ${quoteId}: ${err?.message ?? err}`
    )
    return
  }

  try {
    await quoteService.createQuoteEvents([
      {
        quote_id: quoteId,
        type: "status_changed",
        actor: "system",
        body: {
          from: fromStatus,
          to: "accepted",
          order_id: orderId,
          converted: true,
        },
      },
    ])
  } catch (err: any) {
    logger.warn(
      `quote-on-order-placed: create QuoteEvent failed for ${quoteId}: ${err?.message ?? err}`
    )
  }

  await writeAudit({
    container,
    entity: AUDIT_ENTITY.QUOTE,
    entity_id: quoteId,
    action: AUDIT_ACTION.CONVERTED,
    actor_id: "system",
    details: { from: fromStatus, order_id: orderId },
  })
  // Also surface on the customer's timeline if the quote has one.
  if (typeof quote.customer_id === "string") {
    await writeAudit({
      container,
      entity: AUDIT_ENTITY.CUSTOMER,
      entity_id: quote.customer_id,
      action: AUDIT_ACTION.CONVERTED,
      actor_id: "system",
      details: { quote_id: quoteId, order_id: orderId },
    })
  }

  try {
    captureEvent(quote.email ?? "system", "quote_converted_to_order", {
      quote_id: quoteId,
      order_id: orderId,
      from_status: fromStatus,
    })
  } catch {
    /* best-effort */
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
