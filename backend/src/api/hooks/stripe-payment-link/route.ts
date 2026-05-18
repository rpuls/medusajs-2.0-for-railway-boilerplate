import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import Stripe from "stripe"

import { STRIPE_PAYMENT_LINK_WEBHOOK_SECRET } from "../../../lib/constants"
import { STRIPE_PAYMENT_LINK_MODULE } from "../../../modules/stripe-payment-link"
import type StripePaymentLinkModuleService from "../../../modules/stripe-payment-link/service"
import {
  getStripeClient,
  handleCheckoutSessionCompleted,
} from "../../../services/stripe-payment-link"

/**
 * POST /hooks/stripe-payment-link
 *
 * Dedicated Stripe webhook endpoint for admin-created Payment Links.
 *
 * Separate from `/hooks/payment/stripe_stripe` (which the built-in
 * `@medusajs/payment-stripe` provider owns for cart-checkout PaymentIntents).
 * Mixing the two confuses Medusa's session lookup, so we run a second Stripe
 * webhook endpoint with its own signing secret and subscribe only to
 * `checkout.session.completed`.
 *
 * Two-layer idempotency:
 *   1. stripe_payment_link_event table — inserts the Stripe event ID; the
 *      unique-violation short-circuit returns 200 so retried events are
 *      acknowledged without re-processing.
 *   2. stripe_payment_link.status === "paid" — short-circuits inside the
 *      handler so a Stripe event delivered to multiple endpoints (e.g. a
 *      misconfigured wildcard) doesn't double-apply.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  if (!STRIPE_PAYMENT_LINK_WEBHOOK_SECRET) {
    logger.warn(
      "[stripe-payment-link] webhook hit but STRIPE_PAYMENT_LINK_WEBHOOK_SECRET is unset — rejecting"
    )
    res.status(503).json({ error: "webhook secret not configured" })
    return
  }

  const stripe = getStripeClient()
  if (!stripe) {
    logger.warn(
      "[stripe-payment-link] webhook hit but STRIPE_API_KEY is unset — rejecting"
    )
    res.status(503).json({ error: "stripe api key not configured" })
    return
  }

  const rawBody: Buffer | undefined = (req as any).rawBody
  const signatureHeader = req.get("stripe-signature")
  if (!signatureHeader || !rawBody) {
    res.status(400).json({ error: "missing signature" })
    return
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signatureHeader,
      STRIPE_PAYMENT_LINK_WEBHOOK_SECRET
    )
  } catch (err: any) {
    logger.warn(
      `[stripe-payment-link] signature verification failed: ${err?.message ?? err}`
    )
    res.status(400).json({ error: "invalid signature" })
    return
  }

  const service = req.scope.resolve(
    STRIPE_PAYMENT_LINK_MODULE
  ) as StripePaymentLinkModuleService

  // Event-ID dedupe. A unique-constraint violation here means the event has
  // already been processed; ack with 200 so Stripe stops retrying.
  try {
    await service.createStripePaymentLinkEvents({
      id: event.id,
      event_type: event.type,
    })
  } catch (err: any) {
    const message = String(err?.message ?? "")
    if (/unique|duplicate/i.test(message)) {
      logger.info(
        `[stripe-payment-link] event ${event.id} already processed — idempotent ack`
      )
      res.status(200).json({ ok: true, idempotent: true })
      return
    }
    logger.error(
      `[stripe-payment-link] failed to record event ${event.id}: ${message}`
    )
    res.status(500).json({ error: "event_persist_failed" })
    return
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutSessionCompleted(req.scope, event)
    } else {
      logger.info(
        `[stripe-payment-link] received event ${event.type} (${event.id}) — no handler, acked`
      )
    }
    res.status(200).json({ ok: true })
  } catch (err: any) {
    logger.error(
      `[stripe-payment-link] handler for ${event.type} (${event.id}) failed: ${err?.message ?? err}`
    )
    // Return 5xx so Stripe retries — our event ID was inserted at the top,
    // so a retry will hit the dedupe path. Roll back the dedupe row so the
    // retry actually executes the handler.
    try {
      await service.deleteStripePaymentLinkEvents([event.id])
    } catch {
      // best-effort
    }
    res.status(500).json({ error: "handler_failed" })
  }
}
