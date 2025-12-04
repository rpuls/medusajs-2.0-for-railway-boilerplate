/**
 * Manual script to sync Econt data for testing
 * Run with: pnpm medusa exec ./src/scripts/sync-econt-data.ts
 */

import { ECONT_SHIPPING_MODULE } from "../modules/econt-shipping"
import { ECONT_USERNAME, ECONT_PASSWORD, ECONT_LIVE } from "../lib/constants"

async function syncEcontData() {
  // This script should be run via medusa exec, which provides the container
  // For now, this is a placeholder - you would need to get the container from medusa exec
  console.log("Econt Data Sync Script")
  console.log("======================")
  console.log(`Username: ${ECONT_USERNAME || "not set"}`)
  console.log(`Password: ${ECONT_PASSWORD ? "***" : "not set"}`)
  console.log(`Live: ${ECONT_LIVE}`)
  console.log("")
  console.log("To sync data, use the background job or trigger it via the API.")
  console.log("The sync job runs daily at 2 AM, or you can trigger it manually.")
}

syncEcontData().catch(console.error)

