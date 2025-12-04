import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService } from "@medusajs/framework/types"
import { ECONT_SHIPPING_MODULE } from "../../../../../../modules/econt-shipping"
import { ECONT_USERNAME, ECONT_PASSWORD, ECONT_LIVE } from "../../../../../../lib/constants"
import EcontShippingService from "../../../../../../modules/econt-shipping/service"

/**
 * GET /admin/orders/{id}/econt/shipment-status
 * Get shipment tracking status
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params

    const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
    const econtService = req.scope.resolve<EcontShippingService>(ECONT_SHIPPING_MODULE)

    // Get order
    const order = await orderModuleService.retrieveOrder(id)

    // Get shipment from database using MedusaService's auto-generated listEcontShipments method
    // @ts-ignore - Auto-generated method from MedusaService
    const shipments = await econtService.listEcontShipments({
      order_id: id,
    })

    if (shipments.length === 0) {
      res.status(404).json({
        message: "No shipment found for this order",
      })
      return
    }

    const shipment = shipments[0]

    // Get latest status from Econt API
    const config = {
      username: ECONT_USERNAME,
      password: ECONT_PASSWORD,
      live: ECONT_LIVE,
    }

    if (!config.username || !config.password) {
      res.status(500).json({
        message: "Econt credentials not configured",
      })
      return
    }

    econtService.configure(config)

    const status = await econtService.getShipmentStatus(shipment.loading_num)

    // Update shipment in database using MedusaService's auto-generated updateEcontShipments method
    // @ts-ignore - Auto-generated method from MedusaService
    await econtService.updateEcontShipments([{
      id: shipment.id,
      tracking_data: status,
      status: status.shipments?.e?.is_imported === "1" ? "delivered" : "in_transit",
    }])

    res.json({
      shipment: {
        loading_num: shipment.loading_num,
        pdf_url: shipment.pdf_url,
        status: shipment.status,
        tracking: status,
      },
    })
  } catch (error: any) {
    req.scope.resolve("logger").error("Error getting shipment status:", error)
    res.status(500).json({
      message: error.message || "Failed to get shipment status",
    })
  }
}

