// Import the Agilo Analytics plugin's admin routes
// This ensures the plugin is discovered and registered
import "@agilo/medusa-analytics-plugin/admin"

// The plugin exports its route component via the admin export
// We need to re-export it so the admin-vite-plugin can discover it
// The plugin's admin/index.mjs should export a default component
export { default } from "@agilo/medusa-analytics-plugin/admin"
