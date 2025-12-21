import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BellAlert } from "@medusajs/icons"

export const config = defineRouteConfig({
  label: "Push Notifications",
  icon: BellAlert,
})

// Re-export from push-notification-list
// Note: This will be synced to backend-ui/src/routes/push-notifications/page.tsx
export { default } from "./push-notification-list"

