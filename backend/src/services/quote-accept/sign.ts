import { createHmac, timingSafeEqual } from "node:crypto"

import { NPS_LINK_SECRET } from "../../lib/constants"

/**
 * HMAC-signed quote accept URLs. Re-uses NPS_LINK_SECRET — same trust
 * model as the artwork approval and NPS links.
 */
export function signQuoteAccept(quoteId: string): string {
  const h = createHmac("sha256", NPS_LINK_SECRET)
  h.update(`quote:${quoteId}`)
  return h.digest("hex").slice(0, 24)
}

export function verifyQuoteAccept(quoteId: string, signature: string): boolean {
  if (!quoteId || typeof signature !== "string" || signature.length === 0) {
    return false
  }
  const expected = signQuoteAccept(quoteId)
  if (expected.length !== signature.length) return false
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}
