import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ECONT_SHIPPING_MODULE } from "../../../../modules/econt-shipping"
import EcontShippingService from "../../../../modules/econt-shipping/service"

/**
 * GET /store/econt/quarters?city_id={id}
 * Get all quarters (neighborhoods) for a city
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
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
      username: process.env.ECONT_USERNAME || "demo",
      password: process.env.ECONT_PASSWORD || "demo",
      live: process.env.ECONT_LIVE !== "false",
    })

    // Get quarters from cache (fetches from API if not cached, caches for 1 day)
    const quarters = await econtService.getQuarters(parseInt(cityId))

    // Transform to response format
    const quartersData = quarters.map((quarter: any) => ({
      city_id: quarter.city_id,
      name: quarter.name,
      name_en: quarter.name_en,
    }))

    res.json({
      quarters: quartersData,
    })
  } catch (error: any) {
    req.scope.resolve("logger").error("Error fetching quarters:", error)
    res.status(500).json({
      message: error.message || "Failed to fetch quarters",
    })
  }
}

