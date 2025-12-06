import { getProductsListWithSort, getProductsById } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import ProductTile from "@modules/products/components/product-tile"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products, count },
  } = await getProductsListWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  // Batch fetch priced products for all products (performance optimization)
  const productIds = products.map((p) => p.id!).filter(Boolean)
  const pricedProducts = await getProductsById({
    ids: productIds,
    regionId: region.id,
  })

  // Create a map for quick lookup
  const pricedProductsMap = new Map(
    pricedProducts.map((p) => [p.id, p])
  )

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {products.map((p, index) => {
          const pricedProduct = pricedProductsMap.get(p.id!)
          // Only render if we have priced product data
          if (!pricedProduct) {
            return null
          }
          return (
            <li key={p.id}>
              <ProductTile 
                product={p} 
                region={region}
                countryCode={countryCode}
                priority={index < 4} // Prioritize first 4 images for LCP
                pricedProduct={pricedProduct}
              />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
