import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import Stripe from "stripe"

import { BACKEND_URL } from "../../lib/constants"
import StripePaymentLinkModuleService from "../../modules/stripe-payment-link/service"
import { STRIPE_PAYMENT_LINK_MODULE } from "../../modules/stripe-payment-link"

import { getStripeClient } from "./client"

export type Scenario = "deposit" | "balance" | "quote" | "manual" | "full"

export type CreatePaymentLinkInput = {
  amountCents: number
  currency: string
  label?: string
  scenario: Scenario
  orderId?: string | null
  quoteId?: string | null
  createdByUserId?: string | null
  metadata?: Record<string, string>
}

export type CreatePaymentLinkResult = {
  id: string
  stripe_link_id: string
  url: string
  amount_cents: number
  currency: string
  scenario: Scenario
}

const DEFAULT_LABEL: Record<Scenario, string> = {
  deposit: "Deposit",
  balance: "Balance payment",
  quote: "Quote payment",
  manual: "Payment",
  full: "Full payment",
}

/**
 * Build a Stripe Payment Link backed by a one-shot Product + Price, persist
 * the local audit row, and return the URL ready for staff to forward to the
 * customer.
 *
 * Stripe metadata is stamped in two places — on the Payment Link AND on the
 * Payment Intent that the link will eventually mint — because Stripe only
 * propagates `Payment Link.metadata` onto the resulting Checkout Session if
 * we also set `payment_intent_data.metadata`. Belt-and-braces means the
 * webhook can recover `order_id` from either object.
 *
 * The link is restricted to one completed session via `restrictions` so the
 * URL stops working once the customer has paid — extra safety on top of the
 * webhook-level "already paid" idempotency check.
 */
export const createPaymentLink = async (
  container: MedusaContainer,
  input: CreatePaymentLinkInput
): Promise<CreatePaymentLinkResult> => {
  const stripe = getStripeClient()
  if (!stripe) {
    throw new Error(
      "STRIPE_API_KEY is not configured — cannot create Stripe Payment Links"
    )
  }

  if (!input.amountCents || input.amountCents < 50) {
    // Stripe minimum is 50 cents for AUD/USD. Surface a clear error
    // rather than letting Stripe reject with a vague message.
    throw new Error(
      `amountCents must be at least 50 (got ${input.amountCents})`
    )
  }
  if (!input.orderId && !input.quoteId) {
    throw new Error("Either orderId or quoteId is required")
  }

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve(
    STRIPE_PAYMENT_LINK_MODULE
  ) as StripePaymentLinkModuleService

  const currency = input.currency.toLowerCase()
  const label = input.label?.trim() || DEFAULT_LABEL[input.scenario]
  const anchor = input.orderId
    ? `order ${input.orderId}`
    : `quote ${input.quoteId}`

  const sharedMetadata: Record<string, string> = {
    sc_prints_origin: "admin",
    scenario: input.scenario,
    ...(input.orderId ? { order_id: input.orderId } : {}),
    ...(input.quoteId ? { quote_id: input.quoteId } : {}),
    ...(input.metadata ?? {}),
  }

  const product = await stripe.products.create({
    name: `${label} — ${anchor}`,
    metadata: sharedMetadata,
  })

  const price = await stripe.prices.create({
    product: product.id,
    currency,
    unit_amount: input.amountCents,
  })

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: sharedMetadata,
    payment_intent_data: {
      metadata: sharedMetadata,
      description: `${label} — ${anchor}`,
    },
    after_completion: {
      type: "hosted_confirmation",
      hosted_confirmation: {
        custom_message:
          "Thanks! Your payment has been received. SC Prints will be in touch shortly.",
      },
    },
    restrictions: {
      completed_sessions: { limit: 1 },
    },
    automatic_tax: { enabled: false },
    allow_promotion_codes: false,
  })

  const amountMajor = input.amountCents / 100

  const persisted = await service.createStripePaymentLinks({
    stripe_link_id: link.id,
    url: link.url,
    order_id: input.orderId ?? null,
    quote_id: input.quoteId ?? null,
    amount: amountMajor,
    currency_code: currency,
    scenario: input.scenario,
    label,
    status: "open",
    created_by_user_id: input.createdByUserId ?? null,
    metadata: {
      stripe_product_id: product.id,
      stripe_price_id: price.id,
    },
  })

  logger.info(
    `[stripe-payment-link] created link ${link.id} for ${anchor} (${currency.toUpperCase()} ${amountMajor.toFixed(2)})`
  )

  return {
    id: persisted.id,
    stripe_link_id: link.id,
    url: link.url,
    amount_cents: input.amountCents,
    currency,
    scenario: input.scenario,
  }
}

/**
 * Deactivate a Stripe Payment Link in both Stripe and our local audit row.
 * Returns the updated row. Throws if the row doesn't exist or is already paid.
 */
export const deactivatePaymentLink = async (
  container: MedusaContainer,
  paymentLinkRowId: string
): Promise<void> => {
  const stripe = getStripeClient()
  if (!stripe) {
    throw new Error("STRIPE_API_KEY is not configured")
  }
  const service = container.resolve(
    STRIPE_PAYMENT_LINK_MODULE
  ) as StripePaymentLinkModuleService

  const row = await service.retrieveStripePaymentLink(paymentLinkRowId)
  if (row.status === "paid") {
    const err = new Error("Cannot deactivate a paid payment link")
    ;(err as any).status = 409
    throw err
  }
  if (row.status === "deactivated") {
    return
  }
  await stripe.paymentLinks.update(row.stripe_link_id, { active: false })
  await service.updateStripePaymentLinks({
    id: paymentLinkRowId,
    status: "deactivated",
  } as any)
}

export const buildAdminLinkUrl = (
  orderId: string | null,
  quoteId: string | null
): string => {
  const base = BACKEND_URL.replace(/\/$/, "")
  if (orderId) return `${base}/app/orders/${orderId}`
  if (quoteId) return `${base}/app/quotes/${quoteId}`
  return base
}

export type StripeSdk = Stripe
