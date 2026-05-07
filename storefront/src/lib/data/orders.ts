"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"
import { authedNextHeaders } from "./sdk-helpers"

import type { CustomizerMetadata } from "@modules/customizer/lib/types"

const ORDER_FIELDS =
  "*payment_collections.payments,*fulfillments,+fulfillments.metadata,+fulfillments.labels,*shipping_methods,+shipping_methods.detail"

// No-op: Medusa now returns shipping/payment amounts in major units (decimals), same scale as
// `price.amount`. The previous ÷100 normaliser was double-dividing and turning $16.50 shipping into
// $0.17 on the order confirmation page.
const normalizeOrderUnits = <T extends Record<string, any>>(order: T): T => order

export const retrieveOrder = cache(async function (id: string) {
  const headers = await authedNextHeaders({ tags: ["order"] })
  return sdk.store.order
    .retrieve(id, { fields: ORDER_FIELDS }, headers)
    .then(({ order }) => normalizeOrderUnits(order as any))
    .catch((err) => medusaError(err))
})

/**
 * Returns the saved customizer state for a single line item on a past order, or
 * null if the line wasn't built with the customizer (or doesn't belong to the
 * caller). Used by the customizer to rehydrate when arriving via
 * `?reorder=<order_id>:<line_item_id>`.
 */
export const getOrderLineCustomizerMetadata = cache(async function (
  orderId: string,
  lineItemId: string
): Promise<CustomizerMetadata | null> {
  try {
    const order = await retrieveOrder(orderId)
    const items = (order as { items?: Array<{ id: string; metadata?: Record<string, unknown> }> })
      ?.items
    if (!items?.length) return null
    const line = items.find((i) => i.id === lineItemId)
    const raw = line?.metadata?.customizerDesign
    if (!raw || typeof raw !== "object") return null
    const candidate = raw as Partial<CustomizerMetadata>
    if (candidate.type !== "fabric_customizer") return null
    return candidate as CustomizerMetadata
  } catch {
    return null
  }
})

export const listOrders = cache(async function (
  limit: number = 10,
  offset: number = 0
) {
  const headers = await authedNextHeaders({ tags: ["order"] })
  return sdk.store.order
    .list({ limit, offset, fields: ORDER_FIELDS }, headers)
    .then(({ orders }) => orders.map((o: any) => normalizeOrderUnits(o)))
    .catch((err) => medusaError(err))
})
