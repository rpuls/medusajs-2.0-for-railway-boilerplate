import { Modules } from "@medusajs/framework/utils"
import { IOrderModuleService, ICartModuleService } from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

/**
 * Subscriber that saves Econt shipping data from cart metadata to order metadata
 * when an order is placed
 */
export default async function orderPlacedEcontHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  const cartModuleService: ICartModuleService = container.resolve(Modules.CART)

  try {
    const order = await orderModuleService.retrieveOrder(data.id, {
      relations: ["items", "summary"],
    })

    // Get cart ID from order (if available in order metadata or relations)
    // In MedusaJS, we might need to store cart_id in order metadata during order creation
    // For now, we'll check if Econt data is already in order metadata from cart
    // If not, we'll try to get it from the cart that created this order

    // Check if order already has Econt data in metadata
    if (order.metadata?.econt) {
      // Already saved, skip
      return
    }

    // Try to get cart from order context or metadata
    const cartId = order.metadata?.cart_id as string | undefined

    if (cartId) {
      const cart = await cartModuleService.retrieveCart(cartId)

      if (cart.metadata?.econt) {
        // Save Econt data to order metadata
        await orderModuleService.updateOrders(data.id, {
          metadata: {
            ...order.metadata,
            econt: cart.metadata.econt,
          },
        })
      }
    }
  } catch (error) {
    container.resolve("logger").error("Error saving Econt data to order:", error)
    // Don't throw - order placement should not fail if Econt data save fails
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}

