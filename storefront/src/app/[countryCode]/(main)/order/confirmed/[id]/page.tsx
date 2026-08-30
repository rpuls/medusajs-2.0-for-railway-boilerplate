import { Metadata } from "next"

import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { notFound } from "next/navigation"
import { enrichLineItems } from "@lib/data/cart"
import { retrieveOrder } from "@lib/data/orders"
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

  return {
    ...order,
    items: enrichedItems,
  } as unknown as HttpTypes.StoreOrder
}

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "You purchase was successful",
}

export default async function OrderConfirmedPage({ params }: Props) {
  const { id } = await params
  // retrieveOrder rethrows through medusaError, so without this catch an
  // unknown id escaped to the error boundary and rendered a generic error
  // with a 200 instead of a 404. The account order details page already
  // guards the same call this way.
  const order = await getOrder(id).catch(() => null)
  if (!order) {
    return notFound()
  }

  return <OrderCompletedTemplate order={order} />
}
