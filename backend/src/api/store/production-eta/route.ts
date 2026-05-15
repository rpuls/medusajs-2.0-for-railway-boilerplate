import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { getProductionEta } from "../../../services/production-eta/get-eta"

/**
 * GET /store/production-eta
 *   → { low_days, high_days, baseline_days, queue_days, congested_stages }
 *
 * Powers the live ETA strip on the PDP. Public — no auth — because
 * customers see it pre-checkout.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const eta = await getProductionEta(req.scope)
  res.json(eta)
}
