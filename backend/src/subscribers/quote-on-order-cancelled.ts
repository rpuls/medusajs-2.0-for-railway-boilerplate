import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

import { QUOTE_CONVERSION_ENABLED } from "../lib/constants"
import { QUOTE_MODULE } from "../modules/quote"
import { writeAudit } from "../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../lib/audit-entities"

/**
 * Phase 11 — Cancellation handling for quote-derived orders.
 *
 * Per the planning decision (cancellation = final), the quote stays
 * `accepted` and we append a QuoteEvent noting the cancellation
 * reason. No status revert. If the customer wants to re-order they
 * need a fresh quote.
 */
export default async function quoteOnOrderCancelled({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  if (!QUOTE_CONVERSION_ENABLED) return
  const orderId = data?.id
  if (!orderId) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderService = container.resolve(Modules.ORDER) as any

  let order: any
  try {
    order = await orderService.retrieveOrder(orderId)
  } catch {
    return
  }

  const orderMeta = (order?.metadata ?? {}) as Record<string, unknown>
  // Quote correlation: the Phase 11 conversion subscriber stamps
  // `quote.metadata.order_id` and (in many flows) `order.metadata.quote_id`
  // inherits from the cart. Try both directions.
  let quoteId: string | null = null
  if (typeof orderMeta.quote_id === "string") {
    quoteId = orderMeta.quote_id
  }
  if (!quoteId) {
    // Reverse lookup — query quotes where metadata.order_id matches.
    try {
      const query = container.resolve(ContainerRegistrationKeys.QUERY) as any
      const { data: quotes } = await query.graph({
        entity: "quote",
        fields: ["id"],
        filters: { metadata: { order_id: orderId } } as any,
        pagination: { take: 1 },
      })
      const q = (quotes as any[])?.[0]
      if (q?.id) quoteId = q.id
    } catch {
      /* soft fail */
    }
  }

  if (!quoteId) return

  const quoteService = container.resolve(QUOTE_MODULE) as any
  try {
    await quoteService.createQuoteEvents([
      {
        quote_id: quoteId,
        type: "note",
        actor: "system",
        body: {
          reason: "order_cancelled",
          order_id: orderId,
          note: "Order placed from this quote was cancelled. Per business policy the quote remains accepted — a new quote is required for re-ordering.",
        },
      },
    ])
  } catch (err: any) {
    logger.warn(
      `quote-on-order-cancelled: QuoteEvent failed for ${quoteId}: ${err?.message ?? err}`
    )
  }

  await writeAudit({
    container,
    entity: AUDIT_ENTITY.QUOTE,
    entity_id: quoteId,
    action: AUDIT_ACTION.STATUS_CHANGED,
    actor_id: "system",
    details: {
      kind: "order_cancelled_for_converted_quote",
      order_id: orderId,
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.cancelled",
}
