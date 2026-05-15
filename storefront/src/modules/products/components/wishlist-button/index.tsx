"use client"

import { useState, useTransition } from "react"

import { addToWishlist } from "@lib/data/wishlist"
import { phCapture } from "@lib/posthog"

type Props = {
  productId: string
  variantId?: string | null
  className?: string
}

const Heart = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    width="18"
    height="18"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden
  >
    <path d="M3.5 8.2c0-2.3 1.9-4.2 4.2-4.2 1.5 0 2.7.8 3.3 2 .6-1.2 1.8-2 3.3-2 2.3 0 4.2 1.9 4.2 4.2 0 4.8-7.5 8.3-7.5 8.3S3.5 13 3.5 8.2z" />
  </svg>
)

/**
 * Drop on any PDP. Stateless — re-fetching the customer's wishlist
 * just to know whether this product is bookmarked is overkill for the
 * v1; we keep an optimistic local "saved" flag instead. The server
 * route is idempotent (returns `duplicate: true` if the item already
 * exists), so racing taps don't create duplicate rows.
 */
const WishlistButton = ({ productId, variantId, className }: Props) => {
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const handleClick = () => {
    setError(null)
    setSaved(true)
    startTransition(async () => {
      const res = await addToWishlist({
        product_id: productId,
        variant_id: variantId ?? undefined,
      })
      if (!res.ok) {
        setSaved(false)
        setError(res.error)
        return
      }
      phCapture("wishlist_item_added", {
        product_id: productId,
        variant_id: variantId ?? null,
        duplicate: res.duplicate,
      })
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saved}
      aria-pressed={saved}
      aria-label={saved ? "Saved to wishlist" : "Add to wishlist"}
      title={saved ? "Saved to wishlist" : "Add to wishlist"}
      className={
        className ??
        "inline-flex items-center gap-x-2 rounded-md border border-ui-border-base bg-white px-3 py-2 text-sm font-medium text-ui-fg-base hover:bg-ui-bg-subtle disabled:cursor-not-allowed disabled:text-[var(--brand-secondary)]"
      }
    >
      <Heart filled={saved} />
      <span>{saved ? "Saved" : error ? error : "Save for later"}</span>
    </button>
  )
}

export default WishlistButton
