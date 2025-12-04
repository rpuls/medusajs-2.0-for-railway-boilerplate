import { defineRouteConfig } from "@medusajs/admin-sdk"
import { EcontSettingsPage } from "./components/econt-settings-page"

export const config = defineRouteConfig({
  label: "Econt Shipping",
})

export default EcontSettingsPage


