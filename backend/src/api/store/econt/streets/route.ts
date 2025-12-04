import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ECONT_SHIPPING_MODULE } from "../../../../modules/econt-shipping"
import EcontShippingService from "../../../../modules/econt-shipping/service"

/**
 * GET /store/econt/streets?city_id={id}
 * Get all streets for a city
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

    // Get streets from cache (fetches from API if not cached, caches for 1 day)
    const streets = await econtService.getStreets(parseInt(cityId))

    // Transform to response format
    const streetsData = streets.map((street: any) => ({
      city_id: street.city_id,
      name: street.name,
      name_en: street.name_en,
    }))

    res.json({
      streets: streetsData,
    })
  } catch (error: any) {
    req.scope.resolve("logger").error("Error fetching streets:", error)
    res.status(500).json({
      message: error.message || "Failed to fetch streets",
    })
  }
}

