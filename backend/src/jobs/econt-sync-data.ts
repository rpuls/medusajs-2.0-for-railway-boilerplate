import { MedusaContainer, Logger } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ECONT_SHIPPING_MODULE } from "../modules/econt-shipping"
import EcontShippingService from "../modules/econt-shipping/service"
import { ECONT_USERNAME, ECONT_PASSWORD, ECONT_LIVE } from "../lib/constants"

/**
 * Background job to sync Econt cities, offices, streets, and quarters from API
 * Runs daily to keep data up to date
 * 
 * Note: Cities, offices, streets, and quarters are now cached in memory with 1-day TTL.
 * The data is automatically fetched from the Econt API when needed and cached.
 * This job is kept for backward compatibility but no longer performs syncing.
 */
export default async function econtSyncDataHandler(container: MedusaContainer) {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const econtService: EcontShippingService = container.resolve<EcontShippingService>(ECONT_SHIPPING_MODULE)

  try {
    logger.info("Starting Econt data sync...")

    // Configure service with credentials from constants (which have defaults for dev)
    const config = {
      username: ECONT_USERNAME,
      password: ECONT_PASSWORD,
      live: ECONT_LIVE,
    }

    if (!config.username || !config.password) {
      logger.warn("Econt credentials not configured. Skipping sync.")
      return
    }

    econtService.configure(config)

    // Note: Cities, offices, streets, and quarters are now cached in memory with 1-day TTL
    // The data is automatically fetched from the Econt API when needed and cached
    // This job is kept for backward compatibility but no longer performs syncing
    
    logger.info("Econt data is now cached in memory. Sync job is no longer needed.")
    logger.info("Data will be automatically fetched and cached when requested via API endpoints.")
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    logger.error(`Error during Econt data sync: ${errorMessage}`)
    // Don't throw - let the job system handle retries if needed
  }
}

export const config = {
  name: "econt-sync-data",
  schedule: "0 2 * * *", // Run daily at 2 AM
}

