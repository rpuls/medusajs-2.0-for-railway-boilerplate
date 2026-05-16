"use client"

import { useState } from "react"
import type { VariantStockKind } from "@modules/products/lib/variant-stock"

/**
 * Inline `!` icon with a hover/focus tooltip, used next to size and colour
 * picker entries to flag "may delay shipping" cases.
 *
 * Uses a CSS-only tooltip rather than a portal so it survives inside
 * scrollable size grids and overflow-hidden containers. Click/tap also
 * toggles the tooltip for touch devices.
 */
export default function StockWarningIcon({
  message,
  kind,
  className = "",
}: {
  message: string
  kind: VariantStockKind
  className?: string
}) {
  const [tapped, setTapped] = useState(false)

  // Out-of-stock uses red; everything else (low_stock, backorder) uses amber.
  const colorClasses =
    kind === "out_of_stock"
      ? "bg-rose-100 text-rose-700 ring-rose-200 hover:bg-rose-200"
      : "bg-amber-100 text-amber-800 ring-amber-200 hover:bg-amber-200"

  return (
    <span className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setTapped((v) => !v)
        }}
        onBlur={() => setTapped(false)}
        aria-label={message}
        title={message}
        className={`peer inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none ring-1 transition-colors ${colorClasses}`}
      >
        !
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 z-30 mb-1 hidden w-56 -translate-y-0.5 rounded-md bg-ui-fg-base px-2.5 py-1.5 text-left text-[11px] font-medium leading-snug text-ui-bg-base shadow-lg peer-hover:block peer-focus:block ${
          tapped ? "!block" : ""
        }`}
      >
        {message}
      </span>
    </span>
  )
}
