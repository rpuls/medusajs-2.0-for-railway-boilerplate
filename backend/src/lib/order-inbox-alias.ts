import { ORDER_INBOX_DOMAIN, SUPPORT_REPLY_TO_EMAIL } from "./constants"

/**
 * Per-order Reply-To address. When ORDER_INBOX_DOMAIN is set,
 * generates `inbox+ord<id>@${domain}` so the inbound webhook can
 * route the reply back to the order's timeline. Falls back to the
 * generic SUPPORT_REPLY_TO_EMAIL when unset (existing behaviour).
 *
 * Use the order's short id (last 12 chars) to keep the alias readable
 * and avoid leaking ULID prefixes in the wild — anyone with the full
 * alias can post a comment to that order, so use the existing
 * INBOUND_EMAIL_SECRET to gate the webhook.
 */
export function orderInboxAddress(orderId: string): string | undefined {
  if (!ORDER_INBOX_DOMAIN) return SUPPORT_REPLY_TO_EMAIL
  const short = orderId.slice(-12)
  return `inbox+ord${short}@${ORDER_INBOX_DOMAIN}`
}

/**
 * Parses an inbox alias back to the short order id suffix.
 * Returns null when the address isn't in our format.
 */
export function parseOrderInboxAlias(toAddress: string): string | null {
  if (typeof toAddress !== "string") return null
  const match = toAddress.toLowerCase().match(/inbox\+ord([a-z0-9]{12})@/)
  return match?.[1] ?? null
}
