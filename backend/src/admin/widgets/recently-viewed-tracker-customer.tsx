import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import { useEffect } from "react"

import { recordRecentlyViewed } from "./recently-viewed"

const RecentlyViewedTrackerCustomer = ({ data: customer }: { data: { id: string; email?: string; first_name?: string; last_name?: string } }) => {
  useEffect(() => {
    if (!customer?.id) return
    const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim()
    const title = name || customer.email || customer.id
    recordRecentlyViewed({
      type: "customer",
      id: customer.id,
      title,
      href: `/app/customers/${customer.id}`,
    })
  }, [customer?.id])
  return null
}

export const config = defineWidgetConfig({
  zone: "customer.details.before",
})

export default withWidgetBoundary(RecentlyViewedTrackerCustomer, "recently-viewed-tracker-customer")
