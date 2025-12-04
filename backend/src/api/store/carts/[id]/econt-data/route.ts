import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { ICartModuleService } from "@medusajs/framework/types"

/**
 * POST /store/carts/{id}/econt-data
 * Save Econt shipping data to cart metadata
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const econtData = req.body

    const cartModuleService: ICartModuleService = req.scope.resolve(Modules.CART)

    // Get current cart
    const cart = await cartModuleService.retrieveCart(id)

    // Update cart metadata with Econt data
    await cartModuleService.updateCarts(id, {
      metadata: {
        ...cart.metadata,
        econt: econtData,
      },
    })

    res.json({
      cart: await cartModuleService.retrieveCart(id),
    })
  } catch (error: any) {
    req.scope.resolve("logger").error("Error saving Econt data:", error)
    res.status(500).json({
      message: error.message || "Failed to save Econt data",
    })
  }
}

