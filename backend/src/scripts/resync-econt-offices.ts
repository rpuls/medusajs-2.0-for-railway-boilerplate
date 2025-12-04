/**
 * Script to re-sync all Econt offices for Bulgarian cities
 * This will fetch fresh coordinate data and update the database
 * Run with: pnpm medusa exec ./src/scripts/resync-econt-offices.ts
 */

import { ECONT_SHIPPING_MODULE } from "../modules/econt-shipping"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ECONT_USERNAME, ECONT_PASSWORD, ECONT_LIVE } from "../lib/constants"

export default async function resyncEcontOffices({ container }: any) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const econtService = container.resolve(ECONT_SHIPPING_MODULE)

  try {
    logger.info("Starting re-sync of Econt offices for Bulgarian cities...")

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

    // Get all Bulgarian cities
    const cities = await econtService.econtCityRepository_.find({
      where: {
        country_code: "BG",
      },
    })

    logger.info(`Found ${cities.length} Bulgarian cities. Re-syncing offices...`)

    let totalSynced = 0
    let totalErrors = 0

    // Sync offices for each city in batches
    const batchSize = 5
    for (let i = 0; i < cities.length; i += batchSize) {
      const batch = cities.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (city: any) => {
          try {
            const cityId = city.city_id
            logger.info(`Syncing offices for city ${cityId} (${city.name})...`)
            
            // Sync offices for this city (this will delete old ones and create new ones)
            await econtService.syncOffices(cityId)
            
            // Verify the sync worked
            const offices = await econtService.econtOfficeRepository_.find({
              where: { city_id: cityId },
            })
            
            const officesWithCoords = offices.filter(
              (o: any) => o.latitude && o.longitude
            )
            
            logger.info(
              `City ${cityId} (${city.name}): ${officesWithCoords.length} offices with coordinates synced`
            )
            
            // Log sample coordinates to verify they're decimal
            if (officesWithCoords.length > 0) {
              const sample = officesWithCoords[0] as any
              logger.info(
                `Sample coordinates for ${sample.name}: lat=${sample.latitude}, lng=${sample.longitude}`
              )
            }
            
            totalSynced += officesWithCoords.length
          } catch (error: any) {
            logger.error(`Error syncing offices for city ${city.city_id}:`, error)
            totalErrors++
          }
        })
      )

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < cities.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    logger.info(
      `Re-sync completed: ${totalSynced} offices synced, ${totalErrors} errors`
    )
  } catch (error: any) {
    logger.error("Error during office re-sync:", error)
    throw error
  }
}



