import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar } from "@medusajs/icons"

// Import the Agilo Analytics plugin's admin routes
// This ensures the plugin is discovered and registered
import "@agilo/medusa-analytics-plugin/admin"

export const config = defineRouteConfig({
  label: "Analytics",
  icon: ChartBar,
})

// The plugin exports its route component via the admin export
// We need to re-export it so the admin-vite-plugin can discover it
export { default } from "@agilo/medusa-analytics-plugin/admin"


