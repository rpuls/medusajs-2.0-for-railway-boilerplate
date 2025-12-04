import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService } from "@medusajs/framework/types"
import { ECONT_SHIPPING_MODULE } from "../../../../../../modules/econt-shipping"
import EcontShippingService from "../../../../../../modules/econt-shipping/service"

/**
 * POST /admin/orders/{id}/econt/create-shipment
 * Create a shipment via Econt API
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const loadingData = req.body

    const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
    const econtService = req.scope.resolve<EcontShippingService>(ECONT_SHIPPING_MODULE)
    const logger = req.scope.resolve("logger")

    // Get order
    const order = await orderModuleService.retrieveOrder(id, {
      relations: ["items", "summary", "shipping_address", "billing_address"],
    })

    // Get Econt data from order metadata
    const econtData = order.metadata?.econt as any
    if (!econtData) {
      res.status(400).json({
        message: "Order does not have Econt shipping data",
      })
      return
    }

    // Get settings from database with fallback to constants
    const settings = await econtService.getSettingsWithFallback()

    // Configure Econt service with credentials from settings
    const config = {
      username: settings.username,
      password: settings.password,
      live: settings.live,
    }

    if (!config.username || !config.password) {
      res.status(500).json({
        message: "Econt credentials not configured",
      })
      return
    }

    econtService.configure(config)

    // Build loading data from order and Econt data
    // This is a simplified version - you'll need to build the full XML structure
    // based on Econt API requirements
    const fullLoadingData: Record<string, any> = {
      // Add order data
      order_num: order.display_id || order.id,
      
      // Add sender data based on sender type configuration
      sender_city: settings.sender_city,
      sender_post_code: settings.sender_post_code,
      ...(settings.sender_type === "OFFICE" && settings.sender_office_code
        ? { sender_office_code: settings.sender_office_code }
        : {}),
      ...(settings.sender_type === "ADDRESS" && settings.sender_street && settings.sender_street_num
        ? {
            sender_street: settings.sender_street,
            sender_street_num: settings.sender_street_num,
            ...(settings.sender_quarter ? { sender_quarter: settings.sender_quarter } : {}),
            ...(settings.sender_building_num ? { sender_street_bl: settings.sender_building_num } : {}),
            ...(settings.sender_entrance_num ? { sender_street_vh: settings.sender_entrance_num } : {}),
            ...(settings.sender_floor_num ? { sender_street_et: settings.sender_floor_num } : {}),
            ...(settings.sender_apartment_num ? { sender_street_ap: settings.sender_apartment_num } : {}),
          }
        : {}),
      
      // Add receiver data from Econt metadata
      receiver_name: order.billing_address?.first_name
        ? `${order.billing_address.first_name} ${order.billing_address.last_name}`
        : order.email,
      receiver_name_person: order.billing_address?.first_name
        ? `${order.billing_address.first_name} ${order.billing_address.last_name}`
        : order.email,
      receiver_email: order.email,
      receiver_phone_num: order.billing_address?.phone || "",
      // Add Econt-specific data
      receiver_city: econtData.city_name || econtData.city || econtData.door_town || econtData.office_town,
      receiver_post_code: econtData.postcode || econtData.door_postcode || econtData.office_postcode,
      receiver_office_code: econtData.office_code || econtData.machine_code || "",
      receiver_street: econtData.street || "",
      receiver_quarter: econtData.quarter || "",
      receiver_street_num: econtData.street_num || "",
      receiver_street_bl: econtData.building_num || "",
      receiver_street_vh: econtData.entrance_num || "",
      receiver_street_et: econtData.floor_num || "",
      receiver_street_ap: econtData.apartment_num || "",
      receiver_shipping_to: econtData.shipping_to || "OFFICE",
    }

    // Merge with any additional loadingData from request body if it's an object
    if (loadingData && typeof loadingData === "object" && !Array.isArray(loadingData)) {
      Object.assign(fullLoadingData, loadingData)
    }

    // Create label via Econt API
    const result = await econtService.createLabel(fullLoadingData)

    // Save shipment to database
    if (result.loadings?.row?.loading_num) {
      const loadingNum = result.loadings.row.loading_num
      const pdfUrl = result.loadings.row.pdf_url || ""

      // Use MedusaService's auto-generated createEcontShipments method
      // @ts-ignore - Auto-generated method from MedusaService
      await econtService.createEcontShipments([{
        order_id: id,
        loading_num: loadingNum,
        loading_id: result.loadings.row.loading_id || "",
        pdf_url: pdfUrl,
        is_imported: result.loadings.row.is_imported === "1",
        status: "created",
        tracking_data: result,
      }])

      // Update order metadata with shipment info
      await orderModuleService.updateOrders(id, {
        metadata: {
          ...order.metadata,
          econt: {
            ...econtData,
            loading_num: loadingNum,
            pdf_url: pdfUrl,
          },
        },
      })
    }

    res.json({
      success: true,
      loading_num: result.loadings?.row?.loading_num,
      pdf_url: result.loadings?.row?.pdf_url,
      result,
    })
  } catch (error: any) {
    req.scope.resolve("logger").error("Error creating Econt shipment:", error)
    res.status(500).json({
      message: error.message || "Failed to create shipment",
    })
  }
}

