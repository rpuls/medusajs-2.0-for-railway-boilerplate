import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { signQuoteAccept } from "../../../../../services/quote-accept/sign"

/**
 * GET /admin/quotes/:id/accept-link
 *   → { url }
 *
 * Returns the signed public URL staff can paste into a customer
 * email so the customer can accept the quote and have a cart built
 * for them. The signature is deterministic — calling this twice
 * returns the same URL.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  if (!id) return res.status(400).json({ error: "id required" })

  const sig = signQuoteAccept(id)
  const storefrontUrl =
    process.env.STOREFRONT_URL?.replace(/\/$/, "") ?? "http://localhost:8000"
  const country = (process.env.STOREFRONT_DEFAULT_COUNTRY_CODE ?? "au").toLowerCase()
  const url = `${storefrontUrl}/${country}/quote-accept/${encodeURIComponent(id)}?sig=${sig}`
  res.json({ url })
}
