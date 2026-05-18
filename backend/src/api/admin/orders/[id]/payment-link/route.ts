import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"

import { STRIPE_API_KEY } from "../../../../../lib/constants"
import { STRIPE_PAYMENT_LINK_MODULE } from "../../../../../modules/stripe-payment-link"
import type StripePaymentLinkModuleService from "../../../../../modules/stripe-payment-link/service"
import { createPaymentLink } from "../../../../../services/stripe-payment-link"

const SCENARIOS = ["deposit", "balance", "manual", "full"] as const

const postSchema = z.object({
  amount_cents: z.coerce.number().int().min(50),
  currency: z.string().min(3).max(8).optional(),
  scenario: z.enum(SCENARIOS).default("manual"),
  label: z.string().max(120).optional(),
})

/**
 * GET /admin/orders/:id/payment-link
 *   → { configured, links: StripePaymentLink[] }
 *
 * Lists every Stripe Payment Link previously created for this order, newest
 * first. `configured` is false when STRIPE_API_KEY is unset so the admin
 * widget can hide the create form.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  const service = req.scope.resolve(
    STRIPE_PAYMENT_LINK_MODULE
  ) as StripePaymentLinkModuleService

  const links = await service.listStripePaymentLinks(
    { order_id: orderId } as any,
    { order: { created_at: "DESC" } } as any
  )

  res.json({
    configured: Boolean(STRIPE_API_KEY),
    links: (links ?? []).map((l: any) => ({
      id: l.id,
      stripe_link_id: l.stripe_link_id,
      url: l.url,
      amount: Number(l.amount ?? 0),
      currency_code: l.currency_code,
      scenario: l.scenario,
      label: l.label,
      status: l.status,
      paid_at: l.paid_at,
      stripe_payment_intent_id: l.stripe_payment_intent_id,
      created_at: l.created_at,
    })),
  })
}

/**
 * POST /admin/orders/:id/payment-link
 *   body: { amount_cents, currency?, scenario, label? }
 *   → { id, stripe_link_id, url, amount_cents, currency, scenario }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id

  if (!STRIPE_API_KEY) {
    return res
      .status(503)
      .json({ error: "STRIPE_API_KEY is not configured on this environment" })
  }

  let body: z.infer<typeof postSchema>
  try {
    body = postSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }

  const orderModule: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  let order: any
  try {
    order = await orderModule.retrieveOrder(orderId)
  } catch {
    return res.status(404).json({ error: "order_not_found" })
  }

  const currency = (body.currency ?? order.currency_code ?? "aud").toLowerCase()

  try {
    const result = await createPaymentLink(req.scope, {
      amountCents: body.amount_cents,
      currency,
      scenario: body.scenario,
      label: body.label,
      orderId,
      createdByUserId: (req as any).auth_context?.actor_id ?? null,
    })
    res.json(result)
  } catch (err: any) {
    const message = err?.message ?? "create_failed"
    res.status(500).json({ error: message })
  }
}
