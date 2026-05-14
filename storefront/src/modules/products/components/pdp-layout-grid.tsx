"use client"

import { ReactNode } from "react"
import { useCustomizeMode } from "@modules/products/context/customize-mode-context"

type Props = {
  asideSlot: ReactNode
  customizerSlot: ReactNode
}

/**
 * Switches PDP layout based on customize-mode state.
 *
 * Browse mode (isCustomizing=false):
 *   12-col grid → aside (col-span-3) + customizer column (col-span-9 with
 *   internal grid-cols-9 → gallery col-span-6 + wizard col-span-3).
 *
 * Customize mode (isCustomizing=true):
 *   Aside is hidden — customizer expands to full width (col-span-12 with
 *   internal grid-cols-12 → canvas col-span-7 + wizard col-span-5). The
 *   wider wizard removes most internal scroll on the pricing/size grids.
 */
export default function PdpLayoutGrid({ asideSlot, customizerSlot }: Props) {
  const { isCustomizing } = useCustomizeMode()

  return (
    <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:items-start lg:gap-x-8 lg:gap-y-8">
      {!isCustomizing && (
        <aside className="flex flex-col gap-y-6 py-8 small:sticky small:top-48 lg:col-span-3 lg:max-w-none lg:py-0">
          {asideSlot}
        </aside>
      )}
      <div
        id="product-customizer"
        className={`grid gap-8 lg:items-start ${
          isCustomizing
            ? "lg:col-span-12 lg:grid-cols-12"
            : "lg:col-span-9 lg:grid-cols-9"
        }`}
      >
        {customizerSlot}
      </div>
    </div>
  )
}
