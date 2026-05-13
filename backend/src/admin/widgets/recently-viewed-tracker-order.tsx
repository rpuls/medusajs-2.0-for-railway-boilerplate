import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import { useEffect } from "react"

import { recordRecentlyViewed } from "./recently-viewed"

const RecentlyViewedTrackerOrder = ({ data: order }: { data: { id: string; display_id?: number | null; email?: string } }) => {
  useEffect(() => {
    if (!order?.id) return
    const title = order.display_id != null
      ? `#${order.display_id}${order.email ? ` · ${order.email}` : ""}`
      : order.id
    recordRecentlyViewed({
      type: "order",
      id: order.id,
      title,
      href: `/app/orders/${order.id}`,
    })
  }, [order?.id])
  return null
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default withWidgetBoundary(RecentlyViewedTrackerOrder, "recently-viewed-tracker-order")
