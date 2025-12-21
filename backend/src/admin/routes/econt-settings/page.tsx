import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CogSixTooth } from "@medusajs/icons"

export const config = defineRouteConfig({
  label: "Econt Shipping",
  icon: CogSixTooth,
})

// Note: The actual EcontSettingsPage component should be created
// For now, this is a placeholder that will be synced to backend-ui
// The component exists in backend-ui/src/routes/settings/econt/components/econt-settings-page.tsx
export { default } from "./components/econt-settings-page"

