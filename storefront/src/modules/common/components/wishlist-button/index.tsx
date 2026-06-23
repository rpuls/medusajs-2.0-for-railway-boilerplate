"use client"

import { useWishlist } from "@lib/context/wishlist-context"
import { clx } from "@medusajs/ui"

type Props = {
  productId: string
  className?: string
  size?: "sm" | "md"
}

const WishlistButton = ({ productId, className, size = "md" }: Props) => {
  const { toggle, has } = useWishlist()
  const saved = has(productId)

  return (
    <button
      type="button"
      aria-label={saved ? "Bỏ lưu sản phẩm" : "Lưu sản phẩm"}
      onClick={(e) => { e.preventDefault(); toggle(productId) }}
      className={clx(
        "flex items-center justify-center rounded-full transition-colors",
        size === "sm" ? "w-7 h-7" : "w-9 h-9",
        saved
          ? "bg-kin-primary text-white"
          : "bg-white/80 text-kin-on-surface-variant hover:bg-white hover:text-kin-primary border border-kin-warm-grey",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className={size === "sm" ? "w-3.5 h-3.5" : "w-[18px] h-[18px]"}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}

export default WishlistButton
