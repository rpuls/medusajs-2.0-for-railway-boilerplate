import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { recomputeScpCartPricing } from "../../../../../lib/recompute-scp-cart-pricing"

const paramsSchema = z.object({
  id: z.string().min(1),
})

/**
 * POST /store/carts/:id/scp-recompute
 *
 * Recomputes cross-cart bulk-tier aggregation prices for every eligible
 * line item on the cart. Called by the storefront after a cart mutation
 * that bypasses our SCP add endpoint (line quantity update via Medusa
 * core, line delete) so cart-line `unit_price` stays aligned with the
 * aggregated tier.
 *
 * Synchronous + idempotent: safe to call back-to-back; subsequent calls
 * find prices already aligned and exit without writes.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = paramsSchema.safeParse(req.params ?? {})
  if (!parsed.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid cart id: ${parsed.error.message}`
    )
  }

  const result = await recomputeScpCartPricing(parsed.data.id, req.scope)
  return res.status(200).json({
    ok: true,
    cart_id: parsed.data.id,
    aggregated_quantity: result.aggregated_quantity,
    eligible_line_ids: result.eligible_line_ids,
    excluded_line_ids: result.excluded_line_ids,
    updates: result.updates,
  })
}
