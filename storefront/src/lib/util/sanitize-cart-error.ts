/**
 * Defence-in-depth for cart-add error messages shown to customers.
 *
 * The backend `classifyCartAddError` already maps known patterns to friendly
 * copy and returns clean messages. This helper is a safety net for the cases
 * where:
 *   - the error wasn't routed through the typed MedusaError path
 *   - a third-party module threw a verbose / structured message
 *   - the storefront is talking to an older backend that hasn't been
 *     re-deployed yet
 *
 * Strips internal paths, JSON-encoded stack traces, and matches well-known
 * patterns so customers see actionable language ("size out of stock") rather
 * than a wall of red text with `/app/.medusa/server/node_modules/...`.
 */

const KNOWN_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /required inventory|insufficient inventory|out of stock/i,
    message:
      "Sorry — one of the sizes in your order is out of stock. Reduce the quantity or pick a different size and try again.",
  },
  {
    pattern: /no .*price|calculated_price/i,
    message:
      "This variant isn't available in your region's price list. Pick a different size or contact us if you think this is wrong.",
  },
  {
    pattern: /sales channel/i,
    message:
      "This variant isn't available in this store. Try a different size or get in touch.",
  },
]

/**
 * Returns a customer-safe message. Always non-empty, always single-line,
 * never contains file paths or stack frames.
 */
export function sanitizeCartAddError(raw: string): string {
  const trimmed = (raw ?? "").toString().trim()
  if (!trimmed) {
    return "Could not add to cart. Please try again or contact us if the problem persists."
  }

  // Match against known leak-prone patterns first — even if the backend
  // already replaced the message, it doesn't hurt to map any residual cases.
  for (const { pattern, message } of KNOWN_PATTERNS) {
    if (pattern.test(trimmed)) return message
  }

  // If the message embeds JSON / file paths / stack frames, scrub it.
  const looksLikeRawError =
    trimmed.includes("/app/") ||
    trimmed.includes("\\n") ||
    trimmed.includes("node_modules") ||
    trimmed.includes('"stack"') ||
    /^[A-Za-z]+: .* at /.test(trimmed) ||
    trimmed.length > 280
  if (looksLikeRawError) {
    return "Couldn't add this item to your cart. Please try again, or contact us if the problem keeps happening."
  }

  return trimmed
}
