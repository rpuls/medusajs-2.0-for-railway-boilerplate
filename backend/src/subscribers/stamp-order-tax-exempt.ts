import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type {
  ICustomerModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

/**
 * On `order.placed`, snapshot the customer's `tax_exempt` flag onto
 * the order itself. The tax-invoice PDF reads `order.metadata` rather
 * than `customer.metadata` so the invoice reflects the customer's
 * status *at the time of purchase* — even if their tax status changes
 * later.
 */
export default async function stampOrderTaxExempt({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data?.id
  if (!orderId) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  const customerModuleService: ICustomerModuleService = container.resolve(
    Modules.CUSTOMER
  )

  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId)
  } catch {
    return
  }
  if (!order?.customer_id) return

  const orderMeta = (order.metadata ?? {}) as Record<string, unknown>
  if (orderMeta.tax_exempt !== undefined) return

  try {
    const customer = await customerModuleService.retrieveCustomer(
      order.customer_id
    )
    const customerMeta = ((customer as any).metadata ?? {}) as Record<string, unknown>
    if (customerMeta.tax_exempt !== true) return
    await orderModuleService.updateOrders(orderId, {
      metadata: {
        ...orderMeta,
        tax_exempt: true,
        tax_exempt_reason: customerMeta.tax_exempt_reason ?? null,
        tax_exempt_abn: customerMeta.tax_exempt_abn ?? null,
      },
    })
  } catch (err: any) {
    logger.warn(
      `stamp-order-tax-exempt: failed for ${orderId}: ${err?.message ?? err}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
