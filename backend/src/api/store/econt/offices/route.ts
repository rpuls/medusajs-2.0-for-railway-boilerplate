import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ECONT_SHIPPING_MODULE } from "../../../../modules/econt-shipping"
import { ECONT_USERNAME, ECONT_PASSWORD, ECONT_LIVE } from "../../../../lib/constants"
import EcontShippingService from "../../../../modules/econt-shipping/service"

/**
 * GET /store/econt/offices?city_id={id}
 * Get all offices for a city
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const logger = req.scope.resolve("logger")
    const cityId = req.query.city_id as string

    if (!cityId) {
      res.status(400).json({
        message: "city_id query parameter is required",
      })
      return
    }

    const econtService = req.scope.resolve<EcontShippingService>(ECONT_SHIPPING_MODULE)

    // Configure service with credentials
    econtService.configure({
      username: ECONT_USERNAME || "demo",
      password: ECONT_PASSWORD || "demo",
      live: ECONT_LIVE !== false,
    })

    // First verify the city is Bulgarian before fetching offices
    const cityIdNum = parseInt(cityId)
    if (isNaN(cityIdNum) || cityIdNum <= 0) {
      res.status(400).json({
        message: "Invalid city_id",
      })
      return
    }

    // Verify city is Bulgarian by checking cities cache
    try {
      const allCities = await econtService.getCities()
      const city = allCities.find((c: any) => c.city_id === cityIdNum)
      if (!city) {
        logger.warn(`City ${cityIdNum} not found in Bulgarian cities list, rejecting office fetch`)
        res.status(404).json({
          message: `City ${cityIdNum} not found in Bulgarian cities`,
          offices: [],
        })
        return
      }
      const isBulgarian = city.country_code === "BG" || city.country_code === "BGR" || city.country_id === 1033
      if (!isBulgarian) {
        logger.warn(`City ${cityIdNum} (${city.name}) is not Bulgarian (country_code: ${city.country_code}), rejecting office fetch`)
        res.status(400).json({
          message: `City ${cityIdNum} is not a Bulgarian city`,
          offices: [],
        })
        return
      }
      logger.info(`Verified city ${cityIdNum} (${city.name}) is Bulgarian, fetching offices`)
    } catch (error: any) {
      logger.error("Error verifying city:", error)
      res.status(500).json({
        message: `Failed to verify city: ${error.message || "Unknown error"}`,
      })
      return
    }

    // Get offices from cache (fetches from API if not cached, caches for 1 day)
    // getOffices already filters to Bulgarian cities only and by coordinates
    let offices: any[] = []
    try {
      offices = await econtService.getOffices(cityIdNum)
      logger.info(`Fetched ${offices.length} offices for city ${cityIdNum} from cache/API`)
    } catch (error: any) {
      logger.error("Error fetching offices from cache/API:", error)
      res.status(500).json({
        message: `Failed to fetch offices: ${error.message || "Unknown error"}`,
      })
      return
    }

    // Transform to response format - all offices are already verified as Bulgarian
    const officesData = offices.map((office: any) => ({
        office_code: office.office_code,
        name: office.name,
        name_en: office.name_en,
        address: office.address,
        address_en: office.address_en,
        city_id: office.city_id,
        city_name: office.city_name,
        post_code: office.post_code,
        phone: office.phone,
        working_time: office.working_time,
        working_time_saturday: office.working_time_saturday,
        working_time_sunday: office.working_time_sunday,
        latitude: office.latitude,
        longitude: office.longitude,
        is_machine: office.is_machine,
      }))

    logger.info(`Returning ${officesData.length} offices for Bulgarian city ${cityId}`)

    res.json({
      offices: officesData,
    })
  } catch (error: any) {
    req.scope.resolve("logger").error("Error fetching offices:", error)
    res.status(500).json({
      message: error.message || "Failed to fetch offices",
    })
  }
}

