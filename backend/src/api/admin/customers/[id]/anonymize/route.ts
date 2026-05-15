import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { anonymizeCustomer } from "../../../../../services/customer-anonymize/anonymize"

/**
 * POST /admin/customers/:id/anonymize
 *   body: { confirm: true }
 *
 * Anonymises the customer in place. Order history is preserved
 * (PII is broken via the order's `customer_id → redacted email`),
 * but everything reachable from the customer record itself is wiped.
 * See `services/customer-anonymize/anonymize.ts` for the field map.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.params.id
  if (!customerId) {
    return res.status(400).json({ error: "id required" })
  }
  const body = (req.body ?? {}) as any
  if (body.confirm !== true) {
    return res.status(400).json({
      error: "Pass { confirm: true } to anonymise this customer.",
    })
  }
  try {
    const result = await anonymizeCustomer(req.scope, customerId, {
      actorId: (req as any).auth_context?.actor_id ?? null,
    })
    return res.json({ success: true, result })
  } catch (err: any) {
    if (err instanceof MedusaError) {
      return res.status(404).json({ error: err.message })
    }
    return res.status(500).json({
      error: "Failed to anonymise customer",
      detail: String(err?.message ?? err),
    })
  }
}
