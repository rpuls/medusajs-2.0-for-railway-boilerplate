import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Tag } from "@medusajs/icons"

export const config = defineRouteConfig({
  label: "Brands",
  icon: Tag,
})

// Note: The actual brand-list component should be created in brand-list/index.ts
// For now, this is a placeholder that will be synced to backend-ui
export { default } from "./brand-list"

