import { Metadata } from "next"

import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { PurchaseTracker } from "@modules/order/components/purchase-tracker"
import { notFound } from "next/navigation"
import { enrichLineItems } from "@lib/data/cart"
import { retrieveOrder } from "@lib/data/orders"
import { applyDisplayPriceCorrectionToOrder } from "@lib/util/apply-display-price-correction"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ id: string }>
}

async function getOrder(id: string) {
  const order = await retrieveOrder(id)

  if (!order) {
    return
  }

  const enrichedItems = await enrichLineItems(order.items, order.region_id!)
  const withItems = {
    ...order,
    items: enrichedItems,
  } as unknown as HttpTypes.StoreOrder
  applyDisplayPriceCorrectionToOrder(withItems)
  return withItems
}

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "You purchase was successful",
}

export default async function OrderConfirmedPage({ params }: Props) {
  const { id } = await params
  const order = await getOrder(id)
  if (!order) {
    return notFound()
  }

  return (
    <>
      <PurchaseTracker order={order} />
      <OrderCompletedTemplate order={order} />
    </>
  )
}
