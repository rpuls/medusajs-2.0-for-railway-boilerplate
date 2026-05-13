import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import { useEffect } from "react"

import { recordRecentlyViewed } from "./recently-viewed"

const RecentlyViewedTrackerProduct = ({ data: product }: { data: { id: string; title?: string; handle?: string } }) => {
  useEffect(() => {
    if (!product?.id) return
    recordRecentlyViewed({
      type: "product",
      id: product.id,
      title: product.title || product.handle || product.id,
      href: `/app/products/${product.id}`,
    })
  }, [product?.id])
  return null
}

export const config = defineWidgetConfig({
  zone: "product.details.before",
})

export default withWidgetBoundary(RecentlyViewedTrackerProduct, "recently-viewed-tracker-product")
