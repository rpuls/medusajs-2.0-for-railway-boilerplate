import { getProductsList, getProductsListWithSort, getProductsById } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getProductIdsByBrands } from "@lib/data/brands"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/sort-dropdown"
import { getProductPrice } from "@lib/util/get-product-price"
import ProductTile from "@modules/products/components/product-tile"

const PRODUCT_LIMIT = 12

/**
 * Filter products by price range
 * Price filtering happens after fetching priced products since MedusaJS doesn't support price filtering directly
 */
function filterProductsByPrice(
  products: any[],
  priceRange?: string
): any[] {
  if (!priceRange) {
    return products
  }

  return products.filter((product) => {
    const { cheapestPrice } = getProductPrice({ product })
    if (!cheapestPrice) {
      return false
    }

    const price = cheapestPrice.calculated_price_number

    switch (priceRange) {
      case "0-25":
        return price < 25
      case "25-50":
        return price >= 25 && price < 50
      case "50-100":
        return price >= 50 && price < 100
      case "100-200":
        return price >= 100 && price < 200
      case "200+":
        return price >= 200
      default:
        return true
    }
  })
}

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
  collectionIds,
  categoryIds,
  brandIds,
  priceRange,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionIds?: string[]
  categoryIds?: string[]
  brandIds?: string[]
  priceRange?: string
  productsIds?: string[]
  countryCode: string
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      products: <></>,
      totalCount: 0,
      pageSize: PRODUCT_LIMIT,
    }
  }

  // If brand filtering is active, get product IDs for those brands
  let brandFilteredProductIds: string[] = []
  if (brandIds && brandIds.length > 0) {
    brandFilteredProductIds = await getProductIdsByBrands(brandIds)
    
    // If no products found for brands, return empty result
    if (brandFilteredProductIds.length === 0) {
      return {
        products: <></>,
        totalCount: 0,
        pageSize: PRODUCT_LIMIT,
      }
    }
  }

  // Build query params for backend filtering
  const queryParams: PaginatedProductsParams = {
    limit: priceRange ? 100 : PRODUCT_LIMIT, // Fetch more if price filtering needed
  }

  if (collectionIds && collectionIds.length > 0) {
    queryParams["collection_id"] = collectionIds
  }

  if (categoryIds && categoryIds.length > 0) {
    queryParams["category_id"] = categoryIds
  }

  // Combine brand-filtered product IDs with other product IDs
  let finalProductIds = productsIds || []
  if (brandFilteredProductIds.length > 0) {
    if (finalProductIds.length > 0) {
      // Intersection: only products that match both brand filter and other IDs
      finalProductIds = finalProductIds.filter((id) =>
        brandFilteredProductIds.includes(id)
      )
    } else {
      // Use brand-filtered IDs
      finalProductIds = brandFilteredProductIds
    }
  }

  if (finalProductIds.length > 0) {
    queryParams["id"] = finalProductIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  // If we have price filtering, we need to fetch more products to filter client-side
  // Otherwise, use proper backend pagination with filters
  const needsPriceFiltering = !!priceRange
  let products: any[] = []
  let count = 0

  if (needsPriceFiltering) {
    // Fetch all matching products (up to 100) for price filtering
    // Use getProductsList to get backend-filtered products, then filter by price client-side
    const result = await getProductsList({
      pageParam: 1, // Fetch first page with limit 100
      queryParams: {
        ...queryParams,
        limit: 100,
      },
      countryCode,
    })
    products = result.response.products
    count = result.response.count
  } else {
    // Use proper backend pagination when no price filter
    // Backend handles collection_id and category_id filtering
    const result = await getProductsList({
      pageParam: page,
      queryParams: {
        ...queryParams,
        limit: PRODUCT_LIMIT,
      },
      countryCode,
    })
    products = result.response.products
    count = result.response.count
  }

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

  // Map to priced products (products already filtered by collection/category from backend)
  let filteredProducts = products
    .map((p) => pricedProductsMap.get(p.id!))
    .filter(Boolean) as any[]

  // Filter by price range if specified (client-side since backend doesn't support it)
  if (priceRange) {
    filteredProducts = filterProductsByPrice(filteredProducts, priceRange)
  }

  // Sort by price if needed (always sort after getting priced products)
  if (sortBy && ["price_asc", "price_desc"].includes(sortBy)) {
    const { sortProducts } = await import("@lib/util/sort-products")
    filteredProducts = sortProducts(filteredProducts, sortBy)
  }

  // Paginate results
  let paginatedProducts = filteredProducts
  let totalCount = count
  let totalPages = Math.ceil(count / PRODUCT_LIMIT)
  
  if (needsPriceFiltering) {
    // Client-side pagination for price-filtered results
    const totalFiltered = filteredProducts.length
    totalCount = totalFiltered
    totalPages = Math.ceil(totalFiltered / PRODUCT_LIMIT)
    const startIndex = (page - 1) * PRODUCT_LIMIT
    const endIndex = startIndex + PRODUCT_LIMIT
    paginatedProducts = filteredProducts.slice(startIndex, endIndex)
  }
  // If no price filter, products are already paginated by backend

  const productsList = (
    <>
      <ul
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
        data-testid="products-list"
      >
        {paginatedProducts.map((pricedProduct, index) => {
          if (!pricedProduct) {
            return null
          }
          return (
            <li key={pricedProduct.id}>
              <ProductTile 
                product={pricedProduct} 
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

  return {
    products: productsList,
    totalCount,
    pageSize: PRODUCT_LIMIT,
  }
}
