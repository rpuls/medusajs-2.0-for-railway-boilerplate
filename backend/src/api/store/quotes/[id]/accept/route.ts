import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createCartWorkflow,
  addToCartWorkflow,
} from "@medusajs/medusa/core-flows"
import { z } from "zod"

import { QUOTE_MODULE } from "../../../../../modules/quote"
import type QuoteModuleService from "../../../../../modules/quote/service"
import { getPostHog } from "../../../../../lib/posthog"
import { verifyQuoteAccept } from "../../../../../services/quote-accept/sign"

const schema = z.object({
  sig: z.string().min(16).max(64),
  approver_name: z.string().max(200).optional(),
})

/**
 * POST /store/quotes/:id/accept
 *   body: { sig, approver_name? }
 *   → { ok: true, cart_id, checkout_url }
 *
 * Verifies the HMAC signature, marks the quote `accepted`, and
 * materialises a cart from the quote's line items. Returns a
 * `cart_id` the storefront can redirect to checkout with.
 *
 * Line items must reference real `variant_id`s to be added to cart.
 * Anything missing a `variant_id` (placeholder draft items) is skipped
 * and reported back in `skipped_items` so staff can follow up.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  let body: z.infer<typeof schema>
  try {
    body = schema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  if (!verifyQuoteAccept(id, body.sig)) {
    return res.status(400).json({ error: "invalid_signature" })
  }

  const service = req.scope.resolve<QuoteModuleService>(QUOTE_MODULE)
  let quote: any
  try {
    quote = await service.retrieveQuote(id)
  } catch {
    return res.status(404).json({ error: "not_found" })
  }
  if (quote.status === "lost" || quote.status === "expired") {
    return res
      .status(410)
      .json({ error: "quote no longer accepting", status: quote.status })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  // Pick a region — use the first published region for the quote's currency.
  let regionId: string | null = null
  let salesChannelId: string | null = null
  try {
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "currency_code"],
      pagination: { take: 50, skip: 0 },
    })
    const region =
      (regions as any[])?.find(
        (r) =>
          String(r.currency_code).toLowerCase() ===
          String(quote.currency_code).toLowerCase()
      ) ?? (regions as any[])?.[0]
    regionId = region?.id ?? null
  } catch {
    /* fallthrough */
  }
  if (!regionId) {
    return res.status(500).json({ error: "no_region_configured" })
  }
  try {
    const { data: channels } = await query.graph({
      entity: "sales_channel",
      fields: ["id", "name", "is_disabled"],
      pagination: { take: 20, skip: 0 },
    })
    const live =
      (channels as any[])?.find((c) => c.is_disabled !== true) ??
      (channels as any[])?.[0]
    salesChannelId = live?.id ?? null
  } catch {
    /* fallthrough */
  }

  // Materialise the cart.
  const { result: cart } = await createCartWorkflow(req.scope).run({
    input: {
      region_id: regionId,
      sales_channel_id: salesChannelId ?? undefined,
      email: quote.email,
      currency_code: String(quote.currency_code ?? "aud").toLowerCase(),
      metadata: {
        source: "quote_accept",
        quote_id: id,
        quote_public_id: quote.public_id,
      },
    },
  })

  const lineItems = (quote.line_items as { items?: Array<Record<string, any>> })
    ?.items ?? []
  const addable = lineItems.filter(
    (li) => typeof li?.variant_id === "string" && Number(li?.quantity ?? 0) > 0
  )
  const skipped = lineItems.filter(
    (li) => !addable.includes(li)
  )

  for (const li of addable) {
    try {
      await addToCartWorkflow(req.scope).run({
        input: {
          cart_id: cart.id,
          items: [
            {
              variant_id: String(li.variant_id),
              quantity: Number(li.quantity ?? 1),
            },
          ],
        },
      })
    } catch (err: any) {
      // Soft-fail: skip the line but keep the cart. Staff can chase.
      skipped.push({ ...li, error: String(err?.message ?? err) })
    }
  }

  // Stamp the quote.
  await service.updateQuotes([
    {
      id,
      status: "accepted",
      accepted_at: new Date(),
      metadata: {
        ...((quote.metadata as Record<string, unknown>) ?? {}),
        cart_id: cart.id,
        accepted_by_name: body.approver_name ?? null,
      },
    },
  ])
  await service.createQuoteEvents([
    {
      quote_id: id,
      type: "status_changed",
      actor: body.approver_name ?? "customer",
      body: { from: quote.status, to: "accepted", cart_id: cart.id },
    },
  ])

  getPostHog()?.capture({
    distinctId: quote.email,
    event: "quote accepted",
    properties: {
      quote_id: id,
      public_id: quote.public_id,
      cart_id: cart.id,
      lines_added: addable.length,
      lines_skipped: skipped.length,
    },
  })

  return res.json({
    ok: true,
    cart_id: cart.id,
    lines_added: addable.length,
    skipped_items: skipped,
  })
}
