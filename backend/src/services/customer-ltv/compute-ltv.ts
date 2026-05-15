/**
 * Pure aggregator for a customer's lifetime value. Lives apart from any
 * Medusa container so tests can call it with fixture orders.
 *
 * Definitions:
 *   - lifetime_value     = sum of `total` over non-cancelled orders, in
 *                          the dominant currency (see currency handling)
 *   - order_count        = same set, count
 *   - average_order_value = lifetime_value / order_count (0 if no orders)
 *   - last_order_at      = newest order created_at, or null
 *   - first_order_at     = oldest order created_at, or null
 *   - days_since_last    = whole days between `now` and last_order_at,
 *                          or null when there are no orders
 *
 * Currency handling: orders are summed by their reported `currency_code`.
 * If a customer has orders in multiple currencies we trust the dominant
 * (most orders) currency and discard the rest with a flag — mixed-
 * currency totals would be misleading. Single-region storefronts won't
 * hit this in practice.
 */

export type LtvOrder = {
  total: number | string
  currency_code?: string | null
  status?: string | null
  created_at?: string | Date | null
}

export type LtvSummary = {
  lifetime_value: number
  currency_code: string | null
  order_count: number
  average_order_value: number
  last_order_at: string | null
  first_order_at: string | null
  days_since_last: number | null
  /** True when input orders crossed currencies and totals from the
   *  non-dominant currency were dropped. */
  mixed_currency_truncated: boolean
}

const toNumber = (v: number | string | null | undefined): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0
  if (typeof v === "string") {
    const n = Number.parseFloat(v)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

const toIso = (v: string | Date | null | undefined): string | null => {
  if (!v) return null
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.toISOString()
  if (typeof v === "string") {
    const d = new Date(v)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }
  return null
}

const empty = (): LtvSummary => ({
  lifetime_value: 0,
  currency_code: null,
  order_count: 0,
  average_order_value: 0,
  last_order_at: null,
  first_order_at: null,
  days_since_last: null,
  mixed_currency_truncated: false,
})

export function computeCustomerLtv(
  orders: LtvOrder[] | null | undefined,
  options: { now?: Date } = {}
): LtvSummary {
  if (!orders || orders.length === 0) return empty()

  const eligible = orders.filter((o) => (o?.status ?? "").toLowerCase() !== "canceled")
  if (eligible.length === 0) return empty()

  const byCurrency = new Map<string, { count: number; total: number }>()
  for (const o of eligible) {
    const cc = (o.currency_code ?? "").toLowerCase() || "unknown"
    const entry = byCurrency.get(cc) ?? { count: 0, total: 0 }
    entry.count += 1
    entry.total += toNumber(o.total)
    byCurrency.set(cc, entry)
  }

  let dominantCurrency = "unknown"
  let dominantCount = -1
  for (const [cc, entry] of byCurrency.entries()) {
    if (entry.count > dominantCount) {
      dominantCurrency = cc
      dominantCount = entry.count
    }
  }
  const mixed = byCurrency.size > 1

  const dominantOrders = eligible.filter(
    (o) => ((o.currency_code ?? "").toLowerCase() || "unknown") === dominantCurrency
  )
  const lifetime_value = dominantOrders.reduce(
    (acc, o) => acc + toNumber(o.total),
    0
  )

  const timestamps = dominantOrders
    .map((o) => toIso(o.created_at))
    .filter((v): v is string => v !== null)
    .map((iso) => Date.parse(iso))
    .filter((n) => Number.isFinite(n))

  const last = timestamps.length ? Math.max(...timestamps) : null
  const first = timestamps.length ? Math.min(...timestamps) : null
  const now = (options.now ?? new Date()).getTime()
  const days_since_last =
    last !== null
      ? Math.max(0, Math.floor((now - last) / (1000 * 60 * 60 * 24)))
      : null

  const order_count = dominantOrders.length
  const average_order_value = order_count ? lifetime_value / order_count : 0

  return {
    lifetime_value,
    currency_code: dominantCurrency === "unknown" ? null : dominantCurrency,
    order_count,
    average_order_value,
    last_order_at: last !== null ? new Date(last).toISOString() : null,
    first_order_at: first !== null ? new Date(first).toISOString() : null,
    days_since_last,
    mixed_currency_truncated: mixed,
  }
}
