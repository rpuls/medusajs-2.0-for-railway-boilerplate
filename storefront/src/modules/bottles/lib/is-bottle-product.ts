import type { HttpTypes } from "@medusajs/types"

/**
 * Bottle products carry `metadata.product_class === "bottle"`. Set via the
 * admin "Bottle setup" widget on the product detail page. The PDP template
 * branches on this flag to render the bottle customizer instead of the
 * apparel customizer.
 */
export function isBottleProduct(
  product: HttpTypes.StoreProduct | null | undefined
): boolean {
  if (!product) return false
  const metadata = (product.metadata ?? {}) as Record<string, unknown>
  return metadata.product_class === "bottle"
}
