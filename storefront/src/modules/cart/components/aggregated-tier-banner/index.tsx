"use client"

import { useEffect, useState } from "react"

import { getScpCartAggregate, type ScpCartAggregate } from "@lib/data/cart"

type Props = {
  cartId: string
  /**
   * Variant. `compact` is for the cart drawer (single line).
   * `full` is for the standalone cart page (1-2 lines with savings hint).
   */
  variant?: "compact" | "full"
}

const formatRange = (
  tier: { min_quantity: number; max_quantity?: number } | null
) => {
  if (!tier) return ""
  return typeof tier.max_quantity === "number"
    ? `${tier.min_quantity}-${tier.max_quantity}`
    : `${tier.min_quantity}+`
}

/**
 * Cart-page indicator that surfaces the cross-cart bulk-tier aggregation.
 * Renders only when the cart has at least 10 eligible units (the first tier
 * that yields a discount). Falls back to nothing when the cart hasn't yet
 * unlocked bulk pricing.
 *
 * Data source: `GET /store/carts/{id}/scp-aggregate` via `getScpCartAggregate`.
 * Re-fetches on every mount — the cart page re-renders after any line
 * mutation through Next.js revalidation, so a fresh fetch matches the current
 * cart state without explicit invalidation here.
 */
export default function AggregatedTierBanner({
  cartId,
  variant = "full",
}: Props) {
  const [data, setData] = useState<ScpCartAggregate | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const result = await getScpCartAggregate()
      if (!cancelled) {
        setData(result)
        setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [cartId])

  if (!loaded || !data || !data.active_tier) return null
  // Only show once the customer has unlocked a discount tier. The 1-9 tier
  // doesn't merit a banner — it's the baseline retail price.
  if (data.active_tier.min_quantity < 10) return null

  const tierRange = formatRange(data.active_tier)
  const nextRange = data.next_tier ? formatRange(data.next_tier) : null

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
        <span className="font-semibold">Bulk price applied</span>
        <span className="text-emerald-800/80">
          {tierRange} tier across {data.eligible_quantity} units
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
      <p className="font-semibold text-emerald-900">
        You're getting our {tierRange} bulk price across your order
      </p>
      <p className="text-xs text-emerald-800/90">
        Aggregating {data.eligible_quantity} eligible unit
        {data.eligible_quantity === 1 ? "" : "s"} across every product in your cart.
        {data.excluded_quantity > 0
          ? ` (${data.excluded_quantity} unit${data.excluded_quantity === 1 ? "" : "s"} from non-aggregating items are priced individually.)`
          : ""}
      </p>
      {nextRange && data.units_to_next_tier > 0 && data.units_to_next_tier <= 20 ? (
        <p className="text-xs text-emerald-800/90">
          Add {data.units_to_next_tier} more unit
          {data.units_to_next_tier === 1 ? "" : "s"} to unlock the {nextRange} tier.
        </p>
      ) : null}
    </div>
  )
}
