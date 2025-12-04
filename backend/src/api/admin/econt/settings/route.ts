import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ECONT_SHIPPING_MODULE } from "../../../../modules/econt-shipping"
import EcontShippingService from "../../../../modules/econt-shipping/service"

/**
 * GET /admin/econt/settings
 * Get Econt shipping settings
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const econtService = req.scope.resolve<EcontShippingService>(ECONT_SHIPPING_MODULE)
    
    // Get settings from database (there should only be one record)
    const settings = await econtService.listEcontSettings({
      take: 1,
    })
    
    if (settings.length === 0) {
      // Return default/empty settings if none exist
      res.json({
        settings: {
          username: "",
          password: "",
          live: false,
          sender_type: "OFFICE",
          sender_city: "",
          sender_post_code: "",
          sender_office_code: "",
          sender_street: "",
          sender_street_num: "",
          sender_quarter: "",
          sender_building_num: "",
          sender_entrance_num: "",
          sender_floor_num: "",
          sender_apartment_num: "",
        },
      })
      return
    }
    
    // Don't return password in response for security
    const { password, ...settingsWithoutPassword } = settings[0]
    
    res.json({
      settings: settingsWithoutPassword,
    })
  } catch (error: any) {
    req.scope.resolve("logger").error("Error fetching Econt settings:", error)
    res.status(500).json({
      message: error.message || "Failed to fetch Econt settings",
    })
  }
}

/**
 * POST /admin/econt/settings
 * Create or update Econt shipping settings
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const body = req.body as any
    const econtService = req.scope.resolve<EcontShippingService>(ECONT_SHIPPING_MODULE)
    const logger = req.scope.resolve("logger")
    
    // Validate required fields
    if (!body.username || !body.password) {
      res.status(400).json({
        message: "Username and password are required",
      })
      return
    }
    
    if (!body.sender_city || !body.sender_post_code) {
      res.status(400).json({
        message: "Sender city and post code are required",
      })
      return
    }
    
    if (body.sender_type === "OFFICE" && !body.sender_office_code) {
      res.status(400).json({
        message: "Sender office code is required when sender type is OFFICE",
      })
      return
    }
    
    if (body.sender_type === "ADDRESS" && (!body.sender_street || !body.sender_street_num)) {
      res.status(400).json({
        message: "Sender street and street number are required when sender type is ADDRESS",
      })
      return
    }
    
    // Check if settings already exist
    const existingSettings = await econtService.listEcontSettings({
      take: 1,
    })
    
    const settingsData = {
      username: body.username,
      password: body.password,
      live: body.live === true || body.live === "true",
      sender_type: body.sender_type || "OFFICE",
      sender_city: body.sender_city,
      sender_post_code: body.sender_post_code,
      sender_office_code: body.sender_office_code || null,
      sender_street: body.sender_street || null,
      sender_street_num: body.sender_street_num || null,
      sender_quarter: body.sender_quarter || null,
      sender_building_num: body.sender_building_num || null,
      sender_entrance_num: body.sender_entrance_num || null,
      sender_floor_num: body.sender_floor_num || null,
      sender_apartment_num: body.sender_apartment_num || null,
    }
    
    let result
    if (existingSettings.length > 0) {
      // Update existing settings - MedusaService update methods take { id } and update data
      // @ts-ignore - Auto-generated method from MedusaService
      result = await econtService.updateEcontSettings({ id: existingSettings[0].id }, settingsData)
      logger.info("Econt settings updated")
    } else {
      // Create new settings
      // @ts-ignore - Auto-generated method from MedusaService
      result = await econtService.createEcontSettings([settingsData])
      logger.info("Econt settings created")
    }
    
    // Don't return password in response
    const { password, ...settingsWithoutPassword } = Array.isArray(result) ? result[0] : result
    
    res.json({
      settings: settingsWithoutPassword,
    })
  } catch (error: any) {
    req.scope.resolve("logger").error("Error saving Econt settings:", error)
    res.status(500).json({
      message: error.message || "Failed to save Econt settings",
    })
  }
}


