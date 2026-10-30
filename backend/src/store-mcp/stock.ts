import type { MedusaContainer } from '@medusajs/framework/types'
import { createInventoryLevelsWorkflow, updateInventoryLevelsWorkflow } from '@medusajs/medusa/core-flows'
import { queryOf } from './tools/helpers'

/**
 * Stock, the way Medusa decides it.
 *
 * A variant that does not track stock (manage_inventory off), or allows backorders, can always
 * be bought. Any other variant needs its inventory item to have a stock level at a stock
 * location linked to the cart's sales channel, and the shipping option the shopper picks must
 * ship from a location holding enough of it: Medusa flags the option as insufficient inventory
 * otherwise. A new variant gets an inventory item but a stock level nowhere, which is why it
 * shows as out of stock until someone adds the location to it in the dashboard and only then
 * sets a number. writeStock does both in one go.
 */

export type StockLocation = {
  id: string
  name: string
  city: string | null
  country_code: string | null
  sales_channel_ids: string[]
  fulfillment_provider_ids: string[]
  /** Its shipping fulfillment set, if it has one */
  shipping_set_id: string | null
  /** Whether that set has at least one shipping zone, so stock here can actually be shipped */
  ships: boolean
}

export const loadStockLocations = async (scope: MedusaContainer) => {
  const query = queryOf(scope)
  const [{ data: locations }, { data: stores }] = await Promise.all([
    query.graph({
      entity: 'stock_location',
      fields: [
        'id',
        'name',
        'address.city',
        'address.country_code',
        'sales_channels.id',
        'fulfillment_providers.id',
        'fulfillment_sets.id',
        'fulfillment_sets.type',
        'fulfillment_sets.service_zones.id',
      ],
    }),
    query.graph({ entity: 'store', fields: ['default_location_id', 'default_sales_channel_id'] }),
  ])
  const store = stores[0] as any
  return {
    locations: (locations as any[]).map((location): StockLocation => {
      const shipping = (location.fulfillment_sets ?? []).find((set: any) => set.type === 'shipping')
      return {
        id: location.id,
        name: location.name,
        city: location.address?.city || null,
        country_code: location.address?.country_code?.toLowerCase() || null,
        sales_channel_ids: (location.sales_channels ?? []).map((c: any) => c.id),
        fulfillment_provider_ids: (location.fulfillment_providers ?? []).map((p: any) => p.id),
        shipping_set_id: shipping?.id ?? null,
        ships: Boolean(shipping?.service_zones?.length),
      }
    }),
    defaultLocationId: (store?.default_location_id as string | null) ?? null,
    defaultSalesChannelId: (store?.default_sales_channel_id as string | null) ?? null,
  }
}

export type VariantStock = {
  id: string
  /** "Medusa T-Shirt / L / Black", for the sentences an admin reads */
  label: string
  product_id: string
  product_status: string
  sales_channel_ids: string[]
  manage_inventory: boolean
  /** The variant's one inventory item, or null when it is a bundle of several (or of more than one unit) */
  inventory_item_id: string | null
  levels: Array<{ location_id: string; stocked: number; reserved: number }>
}

export const loadVariantStock = async (scope: MedusaContainer, ids: string[]): Promise<Map<string, VariantStock>> => {
  if (!ids.length) return new Map()
  const { data } = await queryOf(scope).graph({
    entity: 'product_variant',
    fields: [
      'id',
      'title',
      'manage_inventory',
      'product.id',
      'product.title',
      'product.status',
      'product.sales_channels.id',
      'inventory_items.inventory_item_id',
      'inventory_items.required_quantity',
      'inventory_items.inventory.location_levels.location_id',
      'inventory_items.inventory.location_levels.stocked_quantity',
      'inventory_items.inventory.location_levels.reserved_quantity',
    ],
    filters: { id: [...new Set(ids)] },
  })
  return new Map(
    (data as any[]).map((variant) => {
      const links: any[] = variant.inventory_items ?? []
      const single = links.length === 1 && Number(links[0].required_quantity ?? 1) === 1 ? links[0] : null
      return [
        variant.id,
        {
          id: variant.id,
          label: `${variant.product?.title ?? 'Product'} / ${variant.title}`,
          product_id: variant.product?.id,
          product_status: variant.product?.status,
          sales_channel_ids: (variant.product?.sales_channels ?? []).map((c: any) => c.id),
          manage_inventory: Boolean(variant.manage_inventory),
          inventory_item_id: single?.inventory_item_id ?? null,
          levels: (single?.inventory?.location_levels ?? []).map((level: any) => ({
            location_id: level.location_id,
            stocked: Number(level.stocked_quantity ?? 0),
            reserved: Number(level.reserved_quantity ?? 0),
          })),
        },
      ]
    })
  )
}

/** Why a variant's stock cannot be set as a single number, or null when it can */
export const stockProblem = (variant: VariantStock): string | null => {
  if (!variant.manage_inventory) return `"${variant.label}" does not track stock, so it can always be bought.`
  if (!variant.inventory_item_id) {
    return `"${variant.label}" is made of several inventory items; set its stock in the dashboard under Inventory.`
  }
  return null
}

/**
 * Inventory items, among these, that a variant of another product also uses. Items are shared
 * only when an admin links them by hand, for bundles, and writing one changes the stock of that
 * other product too, which may be live.
 */
export const sharedInventoryItems = async (scope: MedusaContainer, inventoryItemIds: string[], productId: string): Promise<Set<string>> => {
  if (!inventoryItemIds.length) return new Set()
  const { data } = await queryOf(scope).graph({
    entity: 'inventory_item',
    fields: ['id', 'variants.product_id'],
    filters: { id: inventoryItemIds },
  })
  return new Set(
    (data as any[]).filter((item) => (item.variants ?? []).some((v: any) => v.product_id !== productId)).map((item) => item.id)
  )
}

/** Sets how many units are stocked at a location, creating the item's stock level there if it has none */
export const writeStock = async (
  scope: MedusaContainer,
  inventoryItemId: string,
  locationId: string,
  quantity: number,
  hasLevel: boolean
) => {
  if (hasLevel) {
    await updateInventoryLevelsWorkflow(scope).run({
      input: { updates: [{ inventory_item_id: inventoryItemId, location_id: locationId, stocked_quantity: quantity }] },
    })
  } else {
    await createInventoryLevelsWorkflow(scope).run({
      input: { inventory_levels: [{ inventory_item_id: inventoryItemId, location_id: locationId, stocked_quantity: quantity }] },
    })
  }
}
