import { getProductsById } from "@lib/data/products"
import { getCustomerTier } from "@lib/data/customer-tier"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
  hideInlinePurchaseControls = false,
}: {
  id: string
  region: HttpTypes.StoreRegion
  hideInlinePurchaseControls?: boolean
}) {
  const [[product], tier] = await Promise.all([
    getProductsById({
      ids: [id],
      regionId: region.id,
    }),
    getCustomerTier(),
  ])

  if (!product) {
    return null
  }

  return (
    <ProductActions
      product={product}
      region={region}
      hideInlinePurchaseControls={hideInlinePurchaseControls}
      tier={tier}
    />
  )
}
