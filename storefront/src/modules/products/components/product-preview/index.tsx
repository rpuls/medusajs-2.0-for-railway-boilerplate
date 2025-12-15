import { Text } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
  pricedProduct: preFetchedPricedProduct,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  pricedProduct?: HttpTypes.StoreProduct // Optional pre-fetched priced product for batch optimization
}) {
  // Use pre-fetched priced product if provided, otherwise fetch it
  let pricedProduct = preFetchedPricedProduct
  
  if (!pricedProduct) {
    const [fetchedPricedProduct] = await getProductsById({
      ids: [product.id!],
      regionId: region.id,
    })
    pricedProduct = fetchedPricedProduct
  }

  if (!pricedProduct) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct,
  })

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
          productName={product.title || undefined}
          categoryName={product.categories?.[0]?.name || undefined}
        />
        <div className="flex txt-compact-medium mt-4 justify-between">
          <Text className="text-text-secondary group-hover:text-text-primary transition-colors" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
