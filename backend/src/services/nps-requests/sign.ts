import { createHmac, timingSafeEqual } from "node:crypto"

import { NPS_LINK_SECRET } from "../../lib/constants"

/**
 * Signs an NPS rating URL so customers can't forge scores by tweaking
 * the URL. Sig is HMAC-SHA256 over `{order_id}:{score}` keyed by
 * `NPS_LINK_SECRET`, truncated to 16 hex chars (96 bits — enough to
 * deter casual tampering, no need for cryptographic-strength here).
 */
export function signNpsRating(orderId: string, score: number): string {
  const h = createHmac("sha256", NPS_LINK_SECRET)
  h.update(`${orderId}:${score}`)
  return h.digest("hex").slice(0, 16)
}

export function verifyNpsRating(
  orderId: string,
  score: number,
  signature: string
): boolean {
  if (!orderId || !signature || typeof signature !== "string") return false
  const expected = signNpsRating(orderId, score)
  if (expected.length !== signature.length) return false
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  } catch {
    return false
  }
}
