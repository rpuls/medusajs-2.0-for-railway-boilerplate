import { MedusaError } from "@medusajs/framework/utils"

/**
 * Pull a single human-readable message out of whatever the Medusa workflow
 * runtime threw. Workflows can reject with:
 *   - a real `Error` instance
 *   - an array of step errors (each may or may not be an `Error`)
 *   - a plain object that *looks like* an Error (has `message` / `name` /
 *     `stack`) but isn't an `instanceof Error` (this is what `addToCartWorkflow`
 *     does in @medusajs/medusa 2.14.x, and is the case that previously leaked
 *     the full stack trace into the customer-facing string)
 *   - a primitive
 *
 * Always returns a clean, single-line message — never includes file paths,
 * stack frames, or JSON dumps. Safe to surface to the storefront UI.
 */
function readMessage(value: unknown): string | null {
  if (value instanceof Error) return value.message || null
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null) {
    const m = (value as { message?: unknown }).message
    if (typeof m === "string" && m.trim()) return m
  }
  return null
}

export function extractWorkflowErrorMessage(workflowError: unknown): string {
  if (Array.isArray(workflowError)) {
    const messages = workflowError
      .map((e) => readMessage(e))
      .filter((m): m is string => Boolean(m))
    if (messages.length > 0) return messages.join("; ")
    return "The cart workflow failed without a specific message."
  }
  return readMessage(workflowError) ?? "The cart workflow failed without a specific message."
}

const INVENTORY_RE = /required inventory|insufficient inventory|out of stock/i
const NO_PRICE_RE = /no .*price|calculated_price/i

type CartAddErrorClassification = {
  type: (typeof MedusaError.Types)[keyof typeof MedusaError.Types]
  message: string
}

/**
 * Map a raw workflow error message to a customer-friendly one. Returns the
 * original message when no known pattern matches — caller decides whether to
 * surface it as INVALID_DATA (400) or fall back to UNEXPECTED_STATE (500).
 */
export function classifyCartAddError(rawMessage: string): CartAddErrorClassification {
  if (INVENTORY_RE.test(rawMessage)) {
    return {
      type: MedusaError.Types.INVALID_DATA,
      message:
        "Sorry — one of the sizes in your order is out of stock. Reduce the quantity or pick a different size and try again.",
    }
  }
  if (NO_PRICE_RE.test(rawMessage)) {
    return {
      type: MedusaError.Types.INVALID_DATA,
      message:
        "This variant isn't available in your region's price list. Pick a different size or contact us if you think this is wrong.",
    }
  }
  return {
    type: MedusaError.Types.UNEXPECTED_STATE,
    message: rawMessage,
  }
}
