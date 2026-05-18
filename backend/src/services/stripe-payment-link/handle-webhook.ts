import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { markPaymentCollectionAsPaid } from "@medusajs/medusa/core-flows"
import Stripe from "stripe"

import { getPostHog } from "../../lib/posthog"
import { STRIPE_PAYMENT_LINK_MODULE } from "../../modules/stripe-payment-link"
import type StripePaymentLinkModuleService from "../../modules/stripe-payment-link/service"

type OrderLinkSummary = {
  link_id: string
  payment_intent_id: string | null
  amount: number
  currency: string
  scenario: string
  paid_at: string
  payment_collection_id: string | null
}

/**
 * Idempotency-aware webhook receiver for `checkout.session.completed`.
 *
 * Flow:
 *   1. Look up the local stripe_payment_link row by stripe_link_id.
 *      No row → log + return (link wasn't created by us).
 *   2. If row.status === "paid", short-circuit (already processed).
 *   3. Resolve order_id (direct from the row, or via quote.metadata.cart_id
 *      → cart.completed order if the row is quote-anchored and the quote
 *      has converted).
 *   4. If we have an order: mint a fresh payment_collection, link it to the
 *      order via the order↔payment_collection remote link, run
 *      markPaymentCollectionAsPaid, and append a summary entry to
 *      order.metadata.stripe_payment_links.
 *   5. If we have no order (orphan quote payment): just stamp the row paid
 *      and log a warning — staff can reconcile manually until v1.1 adds
 *      auto-materialisation.
 *   6. Flip the local row to "paid" and capture a PostHog event.
 */
export const handleCheckoutSessionCompleted = async (
  container: MedusaContainer,
  event: Stripe.Event
): Promise<void> => {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const session = event.data.object as Stripe.Checkout.Session

  if (session.payment_status !== "paid") {
    logger.info(
      `[stripe-payment-link] checkout.session.completed payment_status=${session.payment_status} — ignoring`
    )
    return
  }

  const stripeLinkId =
    typeof session.payment_link === "string"
      ? session.payment_link
      : session.payment_link?.id ?? null

  if (!stripeLinkId) {
    logger.info(
      `[stripe-payment-link] session ${session.id} has no payment_link — ignoring (likely a cart-checkout session)`
    )
    return
  }

  const service = container.resolve(
    STRIPE_PAYMENT_LINK_MODULE
  ) as StripePaymentLinkModuleService

  const rows = await service.listStripePaymentLinks({
    stripe_link_id: stripeLinkId,
  })
  const row = rows?.[0]
  if (!row) {
    logger.warn(
      `[stripe-payment-link] no local row for stripe_link_id=${stripeLinkId} — link wasn't created via /admin/orders/:id/payment-link, ignoring`
    )
    return
  }

  if (row.status === "paid") {
    logger.info(
      `[stripe-payment-link] row ${row.id} already paid — idempotent no-op`
    )
    return
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null

  const sessionAmountCents =
    typeof session.amount_total === "number" ? session.amount_total : null
  const sessionCurrency =
    typeof session.currency === "string"
      ? session.currency.toLowerCase()
      : row.currency_code

  const orderId = row.order_id ?? (await resolveOrderForQuote(container, row))

  if (!orderId) {
    logger.warn(
      `[stripe-payment-link] row ${row.id} (quote_id=${row.quote_id}) paid but no order resolvable — marking row paid; staff must mint the order manually`
    )
    await service.updateStripePaymentLinks({
      id: row.id,
      status: "paid",
      stripe_payment_intent_id: paymentIntentId,
      paid_at: new Date(),
    } as any)
    return
  }

  let paymentCollectionId: string | null = null
  try {
    paymentCollectionId = await applyPaymentToOrder(container, {
      orderId,
      amountCents:
        sessionAmountCents ?? Math.round(Number(row.amount ?? 0) * 100),
      currency: sessionCurrency,
      stripeLinkId,
      paymentIntentId,
      scenario: row.scenario,
    })
  } catch (err) {
    logger.error(
      `[stripe-payment-link] failed to apply payment to order ${orderId} for row ${row.id}: ${(err as Error).message}`
    )
    // Persist a failure marker so admins can see what happened in the widget.
    await service.updateStripePaymentLinks({
      id: row.id,
      stripe_payment_intent_id: paymentIntentId,
      metadata: {
        ...(typeof row.metadata === "object" && row.metadata !== null
          ? (row.metadata as Record<string, unknown>)
          : {}),
        apply_error: {
          message: (err as Error).message,
          failed_at: new Date().toISOString(),
        },
      },
    } as any)
    throw err
  }

  const amountMajor =
    (sessionAmountCents ?? Math.round(Number(row.amount ?? 0) * 100)) / 100
  const paidAtIso = new Date().toISOString()

  await appendOrderMetadataSummary(container, orderId, {
    link_id: stripeLinkId,
    payment_intent_id: paymentIntentId,
    amount: amountMajor,
    currency: sessionCurrency,
    scenario: row.scenario,
    paid_at: paidAtIso,
    payment_collection_id: paymentCollectionId,
  })

  await service.updateStripePaymentLinks({
    id: row.id,
    status: "paid",
    stripe_payment_intent_id: paymentIntentId,
    payment_collection_id: paymentCollectionId,
    paid_at: new Date(paidAtIso),
    order_id: orderId,
  } as any)

  logger.info(
    `[stripe-payment-link] applied ${sessionCurrency.toUpperCase()} ${amountMajor.toFixed(
      2
    )} to order ${orderId} (link=${stripeLinkId}, collection=${paymentCollectionId})`
  )

  const customerEmail =
    session.customer_details?.email ??
    session.customer_email ??
    `order_${orderId}`
  getPostHog()?.capture({
    distinctId: customerEmail,
    event: "stripe payment link paid",
    properties: {
      order_id: orderId,
      stripe_link_id: stripeLinkId,
      payment_intent_id: paymentIntentId,
      amount: amountMajor,
      currency: sessionCurrency,
      scenario: row.scenario,
    },
  })
}

/**
 * Find the order materialised from a quote-anchored row. Quote acceptance
 * stamps `cart_id` on quote.metadata; that cart eventually completes into
 * an order. Returns null if either step is missing.
 */
const resolveOrderForQuote = async (
  container: MedusaContainer,
  row: { quote_id: string | null }
): Promise<string | null> => {
  if (!row.quote_id) return null

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  try {
    const quoteService = container.resolve("quote") as any
    const quote = await quoteService.retrieveQuote(row.quote_id)
    const cartId = (quote?.metadata as any)?.cart_id
    if (!cartId) return null

    const { data: orders } = await query.graph({
      entity: "order",
      filters: { cart_id: cartId } as any,
      fields: ["id"],
      pagination: { take: 1, skip: 0 },
    })
    return (orders as any[])?.[0]?.id ?? null
  } catch {
    return null
  }
}

/**
 * Create a fresh payment_collection, link it to the order, and run
 * markPaymentCollectionAsPaid. Returns the payment_collection ID.
 */
const applyPaymentToOrder = async (
  container: MedusaContainer,
  args: {
    orderId: string
    amountCents: number
    currency: string
    stripeLinkId: string
    paymentIntentId: string | null
    scenario: string
  }
): Promise<string> => {
  const paymentModule = container.resolve(Modules.PAYMENT) as any
  const remoteLink = container.resolve(
    ContainerRegistrationKeys.REMOTE_LINK
  ) as any

  const collection = await paymentModule.createPaymentCollections({
    amount: args.amountCents / 100,
    currency_code: args.currency,
    metadata: {
      real_gateway: "stripe_payment_link",
      stripe_payment_link_id: args.stripeLinkId,
      stripe_payment_intent_id: args.paymentIntentId,
      scenario: args.scenario,
    },
  })

  // The order↔payment_collection link uses the standard core-flow shape;
  // see complete-cart workflow for the canonical creation call.
  await remoteLink.create({
    [Modules.ORDER]: { order_id: args.orderId },
    [Modules.PAYMENT]: { payment_collection_id: collection.id },
  })

  await markPaymentCollectionAsPaid(container).run({
    input: {
      payment_collection_id: collection.id,
      order_id: args.orderId,
    },
  })

  // Tag the resulting Payment with the real gateway so the payment-mix
  // report can attribute revenue to Stripe (the workflow hard-codes
  // pp_system_default as the provider).
  try {
    const { data: payments } = await (
      container.resolve(ContainerRegistrationKeys.QUERY) as any
    ).graph({
      entity: "payment_collection",
      filters: { id: collection.id },
      fields: ["id", "payments.id", "payments.metadata"],
    })
    const paymentId = (payments?.[0]?.payments?.[0]?.id ?? null) as string | null
    if (paymentId) {
      await paymentModule.updatePayment({
        id: paymentId,
        metadata: {
          ...((payments[0].payments[0].metadata as Record<string, unknown>) ??
            {}),
          real_gateway: "stripe_payment_link",
          stripe_payment_link_id: args.stripeLinkId,
          stripe_payment_intent_id: args.paymentIntentId,
        },
      })
    }
  } catch {
    // Best-effort tag — the captured payment still works without it,
    // just the payment-mix report will bucket as "manual" until refreshed.
  }

  return collection.id
}

/** Append a one-line summary of the paid link to order.metadata. */
const appendOrderMetadataSummary = async (
  container: MedusaContainer,
  orderId: string,
  summary: OrderLinkSummary
): Promise<void> => {
  const orderModule = container.resolve(Modules.ORDER) as any
  const order = await orderModule.retrieveOrder(orderId)
  const existing = (order.metadata ?? {}) as Record<string, unknown>
  const links = Array.isArray((existing as any).stripe_payment_links)
    ? ((existing as any).stripe_payment_links as OrderLinkSummary[])
    : []
  // De-dupe by link_id in case the webhook fires twice past our other guards.
  const next = [
    ...links.filter((l) => l.link_id !== summary.link_id),
    summary,
  ]
  await orderModule.updateOrders(orderId, {
    metadata: {
      ...existing,
      stripe_payment_links: next,
    },
  })
}
