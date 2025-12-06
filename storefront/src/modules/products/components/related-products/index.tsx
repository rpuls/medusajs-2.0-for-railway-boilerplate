import { Suspense } from "react"
import { getRegion } from "@lib/data/regions"
import { getProductsList, getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductTile, { ProductTileSkeleton } from "../product-tile"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

type StoreProductParamsWithTags = HttpTypes.StoreProductParams & {
  tags?: string[]
  collection_id?: string[]
  is_giftcard?: boolean
}

type StoreProductWithTags = HttpTypes.StoreProduct & {
  tags?: { value: string }[]
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // edit this function to define your related products logic
  const queryParams: StoreProductParamsWithTags = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  const productWithTags = product as StoreProductWithTags
  if (productWithTags.tags) {
    queryParams.tags = productWithTags.tags
      .map((t) => t.value)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await getProductsList({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  // Batch fetch priced products for all related products (performance optimization)
  const productIds = products.map((p) => p.id!).filter(Boolean)
  const pricedProducts = await getProductsById({
    ids: productIds,
    regionId: region.id,
  })

  // Create a map for quick lookup
  const pricedProductsMap = new Map(
    pricedProducts.map((p) => [p.id, p])
  )

  return (
    <div className="product-page-constraint">
      <div className="flex flex-col items-center text-center mb-16">
        <span className="text-base-regular text-gray-600 mb-6">
          Related products
        </span>
        <p className="text-2xl-regular text-ui-fg-base max-w-lg">
          You might also want to check out these products.
        </p>
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
        {products.map((relatedProduct, index) => {
          const pricedProduct = pricedProductsMap.get(relatedProduct.id!)
          if (!pricedProduct) {
            return null
          }
          return (
            <li key={relatedProduct.id}>
              <Suspense fallback={<ProductTileSkeleton />}>
                <ProductTile
                  product={relatedProduct}
                  region={region}
                  countryCode={countryCode}
                  priority={index < 4} // Prioritize first 4 images for LCP
                  pricedProduct={pricedProduct}
                />
              </Suspense>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
