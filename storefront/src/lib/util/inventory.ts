import { HttpTypes } from "@medusajs/types"

/**
 * Whether a variant can be bought right now, for the machine-readable views
 * of the catalogue (JSON-LD, product Markdown, UCP). Needs
 * `variants.inventory_quantity` in the request's fields: without it every
 * managed variant reads as out of stock.
 */
export const isVariantInStock = (
  variant: HttpTypes.StoreProductVariant | undefined
) =>
  !!variant &&
  (!variant.manage_inventory ||
    !!variant.allow_backorder ||
    (variant.inventory_quantity ?? 0) > 0)
