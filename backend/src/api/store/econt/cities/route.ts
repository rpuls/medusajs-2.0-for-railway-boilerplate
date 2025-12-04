import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ECONT_SHIPPING_MODULE } from "../../../../modules/econt-shipping"
import { ECONT_USERNAME, ECONT_PASSWORD, ECONT_LIVE } from "../../../../lib/constants"
import EcontShippingService from "../../../../modules/econt-shipping/service"

/**
 * GET /store/econt/cities?q={searchQuery}
 * Get cities in Bulgaria from Econt API
 * Optional query parameter 'q' for searching cities by name, postcode, or region
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const logger = req.scope.resolve("logger")
    const { q } = req.query
    const searchQuery = typeof q === "string" ? q.trim().toLowerCase() : ""
    
    // Check if module is available
    let econtService: EcontShippingService
    try {
      econtService = req.scope.resolve<EcontShippingService>(ECONT_SHIPPING_MODULE)
    } catch (error: any) {
      logger.error("Econt shipping module not found:", error)
      res.status(500).json({
        message: "Econt shipping module is not available. Please ensure it is properly configured.",
      })
      return
    }

    // Configure service with credentials (use test credentials in dev if not set)
    if (!ECONT_USERNAME || !ECONT_PASSWORD) {
      logger.warn("Econt credentials not configured, using defaults")
    }
    
    econtService.configure({
      username: ECONT_USERNAME || "demo",
      password: ECONT_PASSWORD || "demo",
      live: ECONT_LIVE !== false,
    })

    // Get cities from cache (fetches from API if not cached, caches for 1 day)
    let cities: any[] = []
    try {
      cities = await econtService.getCities()
      logger.info(`Fetched ${cities.length} Bulgarian cities from cache/API`)
      
      // If search query provided, filter cities by name first, then name_en, postcode, or region
      if (searchQuery) {
        cities = cities.filter((c: any) => {
          const name = (c.name || "").toLowerCase()
          const nameEn = (c.name_en || "").toLowerCase()
          const postcode = (c.post_code || "").toLowerCase()
          const region = (c.region || "").toLowerCase()
          
          // Prioritize city name matches
          const nameStartsWith = name.startsWith(searchQuery)
          const nameEnStartsWith = nameEn.startsWith(searchQuery)
          const nameIncludes = name.includes(searchQuery)
          const nameEnIncludes = nameEn.includes(searchQuery)
          
          const regionMatches = region.includes(searchQuery)
          const postcodeMatches = postcode.includes(searchQuery)
          
          return (
            nameStartsWith || 
            nameEnStartsWith || 
            nameIncludes || 
            nameEnIncludes ||
            (postcodeMatches && !nameIncludes && !nameEnIncludes) ||
            (regionMatches && !nameIncludes && !nameEnIncludes && !postcodeMatches)
          )
        })
        
        // Sort results: cities with name matches first
        cities.sort((a: any, b: any) => {
          const aName = (a.name || "").toLowerCase()
          const aNameEn = (a.name_en || "").toLowerCase()
          const bName = (b.name || "").toLowerCase()
          const bNameEn = (b.name_en || "").toLowerCase()
          
          const aNameStartsWith = aName.startsWith(searchQuery) || aNameEn.startsWith(searchQuery)
          const bNameStartsWith = bName.startsWith(searchQuery) || bNameEn.startsWith(searchQuery)
          const aNameIncludes = aName.includes(searchQuery) || aNameEn.includes(searchQuery)
          const bNameIncludes = bName.includes(searchQuery) || bNameEn.includes(searchQuery)
          
          if (aNameStartsWith && !bNameStartsWith) return -1
          if (!aNameStartsWith && bNameStartsWith) return 1
          if (aNameIncludes && !bNameIncludes) return -1
          if (!aNameIncludes && bNameIncludes) return 1
          return 0
        })
        
        logger.info(`Filtered to ${cities.length} cities matching query: "${searchQuery}"`)
      }
    } catch (error: any) {
      logger.error("Error fetching cities from cache/API:", error)
      res.status(500).json({
        message: `Failed to fetch cities: ${error.message || "Unknown error"}`,
      })
      return
    }

    // Transform to response format
    const citiesData = cities.map((city: any) => ({
      city_id: city.city_id,
      post_code: city.post_code,
      type: city.type,
      name: city.name,
      name_en: city.name_en,
      region: city.region,
      region_en: city.region_en,
      zone_id: city.zone_id,
      country_id: city.country_id,
      office_id: city.office_id,
      country_code: city.country_code,
    }))

    res.json({
      cities: citiesData,
    })
  } catch (error: any) {
    const logger = req.scope.resolve("logger")
    logger.error("Error fetching cities:", error)
    res.status(500).json({
      message: error.message || "Failed to fetch cities",
    })
  }
}

