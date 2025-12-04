import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ECONT_SHIPPING_MODULE } from "../../../../../../modules/econt-shipping"
import { ECONT_USERNAME, ECONT_PASSWORD, ECONT_LIVE } from "../../../../../../lib/constants"
import EcontShippingService from "../../../../../../modules/econt-shipping/service"

/**
 * DELETE /admin/orders/{id}/econt/shipment
 * Delete/cancel a shipment
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params

    const econtService = req.scope.resolve<EcontShippingService>(ECONT_SHIPPING_MODULE)

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

    // Configure Econt service
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

    // Delete label via Econt API
    await econtService.deleteLabel(shipment.loading_num)

    // Delete shipment from database using MedusaService's auto-generated deleteEcontShipments method
    // @ts-ignore - Auto-generated method from MedusaService
    await econtService.deleteEcontShipments([shipment.id])

    res.json({
      success: true,
      message: "Shipment deleted successfully",
    })
  } catch (error: any) {
    req.scope.resolve("logger").error("Error deleting shipment:", error)
    res.status(500).json({
      message: error.message || "Failed to delete shipment",
    })
  }
}

