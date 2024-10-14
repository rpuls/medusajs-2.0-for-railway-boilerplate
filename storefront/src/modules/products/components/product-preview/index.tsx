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
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const [pricedProduct] = await getProductsById({
    ids: [product.id!],
    regionId: region.id,
  })

  if (!pricedProduct) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct,
  })

  console.log("produs",product);

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex flex-col txt-compact-medium mt-4 justify-between">
        <span className=" text-yellow-500">{product.collection?.title.toUpperCase()}</span>
          <Text className="text-ui-fg-subtle font-bold text-[18px]" data-testid="product-title">
            {product.title} 
          </Text>
         
            {cheapestPrice && <div className="flex items-center gap-2"><PreviewPrice price={cheapestPrice} /> <span className="text-[11px]">TVA inclus</span></div>}
         
        </div>
      </div>
    </LocalizedClientLink>
  )
}
