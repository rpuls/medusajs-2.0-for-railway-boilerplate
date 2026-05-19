import type { POSLineItem } from "./types"

export const formatMoney = (
  cents: number | null | undefined,
  currency = "AUD"
): string => {
  if (cents == null || Number.isNaN(cents)) return "—"
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

export const lineSubtotalCents = (item: POSLineItem): number => {
  const unit = item.unit_price_cents ?? 0
  return unit * item.quantity
}

export const cartTotalCents = (items: POSLineItem[]): number =>
  items.reduce((sum, it) => sum + lineSubtotalCents(it), 0)

export const ulid = (): string => {
  // Lightweight ULID-ish; fine for cart-line ids which only need to be
  // locally unique inside a session. Real ULIDs are generated server-side.
  const t = Date.now().toString(36).toUpperCase().padStart(10, "0")
  const r = Array.from({ length: 16 }, () =>
    "0123456789ABCDEFGHJKMNPQRSTVWXYZ".charAt(
      Math.floor(Math.random() * 32)
    )
  ).join("")
  return `${t}${r}`
}
