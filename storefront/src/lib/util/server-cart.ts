import "server-only"

import { sdk } from "@lib/config"
import { defaultCountryCode } from "@lib/data/catalogue"
import { revalidateCacheTag, setCartId } from "@lib/data/cookies"
import { listRegions } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"

/**
 * Carts built outside the storefront's own pages: by an AI agent through the
 * UCP endpoints (src/lib/ucp), and by a /buy permalink. Taken from upstream's
 * dtc-starter.
 */

export const MAX_LINE_ITEM_QUANTITY = 100

/** Makes the cart this browser's current cart and drops its cached cart reads. */
export const activateCart = async (cartId: string) => {
  await setCartId(cartId)
  await revalidateCacheTag("carts")
}

/**
 * The region for an explicit country code, or for the store's default country
 * when none was given. An explicit country no region covers is null, never the
 * default: an agent asking for prices in the US must not be quoted euros.
 */
export const resolveRegion = async (
  countryCode?: string
): Promise<{ countryCode: string; region: HttpTypes.StoreRegion } | null> => {
  const regions = await listRegions()
  const code = countryCode?.toLowerCase() || defaultCountryCode(regions)
  const region = regions.find((r) =>
    r.countries?.some((country) => country.iso_2 === code)
  )
  return code && region ? { countryCode: code, region } : null
}

/**
 * Creates a cart and adds the items one by one. Throws when an item cannot be
 * added (unknown variant, out of stock, not in the sales channel), and the
 * half-filled cart is simply abandoned, as a shopper's would be.
 *
 * `headers` are the shopper's auth headers when there is a shopper: since
 * Medusa 2.22.1 a cart belongs to a customer only if it is created by an
 * authenticated request or transferred later (see transferCart in
 * lib/data/customer.ts). An agent calling the UCP endpoints has none, so its
 * carts are guest carts.
 */
export const createCartWithItems = async (
  regionId: string,
  items: { variant_id: string; quantity: number }[],
  headers: Record<string, string> = {}
) => {
  const { cart } = await sdk.store.cart.create(
    { region_id: regionId },
    {},
    headers
  )
  for (const item of items) {
    await sdk.store.cart.createLineItem(cart.id, item, {}, headers)
  }
  return cart.id
}

/** Returns the requested variant IDs the store does not sell. */
export const findMissingVariantIds = async (variantIds: string[]) => {
  const { variants } = await sdk.client.fetch<{ variants: { id: string }[] }>(
    "/store/product-variants",
    { query: { id: variantIds, fields: "id", limit: variantIds.length } }
  )
  const found = new Set(variants.map((variant) => variant.id))
  return variantIds.filter((id) => !found.has(id))
}
