/**
 * Script to re-sync offices for a single city (for testing)
 * Usage: pnpm medusa exec ./src/scripts/resync-single-city-offices.ts <city_id>
 * Example: pnpm medusa exec ./src/scripts/resync-single-city-offices.ts 6
 */

import { ECONT_SHIPPING_MODULE } from "../modules/econt-shipping"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ECONT_USERNAME, ECONT_PASSWORD, ECONT_LIVE } from "../lib/constants"

export default async function resyncSingleCityOffices({ container }: any) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const econtService = container.resolve(ECONT_SHIPPING_MODULE)

  try {
    // Get city_id from environment variable or use default
    // Usage: CITY_ID=663726 pnpm medusa exec ./src/scripts/resync-single-city-offices.ts
    const cityId = process.env.CITY_ID ? parseInt(process.env.CITY_ID) : 663726

    if (isNaN(cityId)) {
      logger.error("Invalid city_id. Use: CITY_ID=663726 pnpm medusa exec ./src/scripts/resync-single-city-offices.ts")
      return
    }

    logger.info(`Re-syncing offices for city_id: ${cityId}`)

    // Configure service with credentials
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

    // Sync offices for this city
    await econtService.syncOffices(cityId)

    // Verify the sync worked
    const offices = await econtService.econtOfficeRepository_.find({
      where: { city_id: cityId },
    })

    const officesWithCoords = offices.filter(
      (o: any) => o.latitude && o.longitude
    )

    logger.info(
      `✅ Sync completed: ${officesWithCoords.length} offices with coordinates`
    )

    // Log sample coordinates to verify they're decimal
    if (officesWithCoords.length > 0) {
      logger.info("Sample coordinates:")
      officesWithCoords.slice(0, 3).forEach((office: any) => {
        logger.info(
          `  - ${office.name}: lat=${office.latitude}, lng=${office.longitude}`
        )
      })
    }
  } catch (error: any) {
    logger.error("Error during office re-sync:", error)
    throw error
  }
}

