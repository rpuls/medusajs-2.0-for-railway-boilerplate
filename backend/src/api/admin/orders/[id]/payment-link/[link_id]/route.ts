import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { STRIPE_API_KEY } from "../../../../../../lib/constants"
import { STRIPE_PAYMENT_LINK_MODULE } from "../../../../../../modules/stripe-payment-link"
import type StripePaymentLinkModuleService from "../../../../../../modules/stripe-payment-link/service"
import { deactivatePaymentLink } from "../../../../../../services/stripe-payment-link"

/**
 * DELETE /admin/orders/:id/payment-link/:link_id
 *
 * Deactivates a Stripe Payment Link. The local row stays around for audit;
 * status flips to "deactivated". Paid links can't be deactivated — returns 409.
 *
 * `:link_id` is the LOCAL row ID (spl_...), NOT the Stripe link ID.
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  const linkRowId = req.params.link_id

  if (!STRIPE_API_KEY) {
    return res.status(503).json({ error: "STRIPE_API_KEY is not configured" })
  }

  const service = req.scope.resolve(
    STRIPE_PAYMENT_LINK_MODULE
  ) as StripePaymentLinkModuleService

  let row: any
  try {
    row = await service.retrieveStripePaymentLink(linkRowId)
  } catch {
    return res.status(404).json({ error: "link_not_found" })
  }

  // 404 (not 403) so link IDs aren't cross-order enumerable.
  if (row.order_id !== orderId) {
    return res.status(404).json({ error: "link_not_found" })
  }

  try {
    await deactivatePaymentLink(req.scope, linkRowId)
    res.json({ ok: true })
  } catch (err: any) {
    const status = err?.status === 409 ? 409 : 500
    res.status(status).json({ error: err?.message ?? "deactivate_failed" })
  }
}
