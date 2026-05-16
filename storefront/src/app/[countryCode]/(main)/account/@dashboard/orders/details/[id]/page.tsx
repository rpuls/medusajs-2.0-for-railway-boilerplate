import { Metadata } from "next"
import { notFound } from "next/navigation"

import OrderDetailsTemplate from "@modules/order/templates/order-details-template"
import { retrieveOrder } from "@lib/data/orders"
import { enrichLineItems } from "@lib/data/cart"
import { stripHeavyCartMetadataForRender } from "@lib/util/strip-cart-metadata"
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
  // Strip heavy customizer metadata before passing to client components.
  const liteItems = stripHeavyCartMetadataForRender(enrichedItems)
  const withItems = {
    ...order,
    items: liteItems,
  } as unknown as HttpTypes.StoreOrder
  applyDisplayPriceCorrectionToOrder(withItems)
  return withItems
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const order = await getOrder(id).catch(() => null)

  if (!order) {
    notFound()
  }

  return {
    title: `Order #${order.display_id}`,
    description: `View your order`,
  }
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await getOrder(id).catch(() => null)

  if (!order) {
    notFound()
  }

  return <OrderDetailsTemplate order={order} />
}
