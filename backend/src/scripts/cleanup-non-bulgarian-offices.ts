/**
 * Script to clean up offices from non-Bulgarian cities
 * Run with: pnpm medusa exec ./src/scripts/cleanup-non-bulgarian-offices.ts
 */

import { ECONT_SHIPPING_MODULE } from "../modules/econt-shipping"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function cleanupNonBulgarianOffices({ container }: any) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const econtService = container.resolve(ECONT_SHIPPING_MODULE)

  try {
    logger.info("Starting cleanup of non-Bulgarian offices...")

    // Get all offices
    const allOffices = await econtService.econtOfficeRepository_.find({})
    logger.info(`Found ${allOffices.length} total offices in database`)

    let deletedCount = 0
    let keptCount = 0

    // Check each office's city
    for (const office of allOffices) {
      const officeCityId = (office as any).city_id
      
      // Get the city for this office
      const cities = await econtService.econtCityRepository_.find({
        where: { city_id: officeCityId },
      })
      
      const city = cities && cities.length > 0 ? cities[0] : null
      
      if (!city) {
        // City not found - delete the office
        logger.warn(`Office ${(office as any).office_code} has city_id ${officeCityId} but city not found - deleting`)
        try {
          if (office.id) {
            // Use auto-generated deleteEcontOffices method from MedusaService
            // @ts-ignore - Auto-generated method
            await (econtService as any).deleteEcontOffices({ id: office.id })
            deletedCount++
          }
        } catch (error: any) {
          logger.error(`Failed to delete office ${(office as any).office_code}: ${error.message}`)
        }
      } else {
        // Check if city is Bulgarian
        const cityCountryCode = (city as any).country_code
        const cityCountryId = (city as any).country_id
        
        if (cityCountryCode !== "BG" && cityCountryCode !== "BGR" && cityCountryId !== 1033) {
          // City is not Bulgarian - delete the office
          logger.warn(`Office ${(office as any).office_code} is for non-Bulgarian city ${officeCityId} (country: ${cityCountryCode}) - deleting`)
          try {
            if (office.id) {
              // Use auto-generated deleteEcontOffices method from MedusaService
              // @ts-ignore - Auto-generated method
              await (econtService as any).deleteEcontOffices({ id: office.id })
              deletedCount++
            }
          } catch (error: any) {
            logger.error(`Failed to delete office ${(office as any).office_code}: ${error.message}`)
          }
        } else {
          // Additional check: Verify office coordinates are in Bulgaria
          // Bulgaria is roughly 41-44°N, 22-29°E
          // Cyprus/Greece coordinates are around 35°N, 33°E
          const officeLat = (office as any).latitude
          const officeLng = (office as any).longitude
          
          if (officeLat && officeLng) {
            const isBulgarianCoords = officeLat >= 41 && officeLat <= 44 &&
                                      officeLng >= 22 && officeLng <= 29
            
            if (!isBulgarianCoords) {
              // Office has coordinates outside Bulgaria - delete it
              logger.warn(`Office ${(office as any).office_code} has coordinates ${officeLat}, ${officeLng} (not in Bulgaria) - deleting`)
              try {
                if (office.id) {
                  // Use auto-generated deleteEcontOffices method from MedusaService
                  // @ts-ignore - Auto-generated method
                  await (econtService as any).deleteEcontOffices({ id: office.id })
                  deletedCount++
                }
              } catch (error: any) {
                logger.error(`Failed to delete office ${(office as any).office_code}: ${error.message}`)
              }
            } else {
              keptCount++
            }
          } else {
            // No coordinates - keep it (might be a valid office without coordinates)
            keptCount++
          }
        }
      }
    }

    logger.info(`Cleanup completed: ${deletedCount} offices deleted, ${keptCount} Bulgarian offices kept`)
  } catch (error: any) {
    logger.error("Error during cleanup:", error)
    throw error
  }
}

