import { HttpTypes } from "@medusajs/types"
import { getTranslations, getTranslation } from "@lib/i18n/server"
import { getProductsById } from "@lib/data/products"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductTile from "@modules/products/components/product-tile"

interface ProductRailProps {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
  title?: string
  showViewAll?: boolean
  countryCode?: string
}

export default async function ProductRail({
  collection,
  region,
  title,
  showViewAll = true,
  countryCode = "us",
}: ProductRailProps) {
  const { products } = collection

  if (!products || products.length === 0) {
    return null
  }

  // Get translations
  const translations = await getTranslations(countryCode)
  const displayTitle = title || collection.title
  const viewAllText = getTranslation(translations, "homepage.viewAll")

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

  return (
    <div className="content-container py-8 md:py-12">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-text-primary">
          {displayTitle}
        </h2>
        {showViewAll && (
          <InteractiveLink
            href={`/collections/${collection.handle}`}
            className="flex gap-x-1 items-center text-sm md:text-base text-text-secondary hover:text-primary transition-colors"
          >
            {viewAllText}
          </InteractiveLink>
        )}
      </div>
      {/* Horizontal Scrollable Product Carousel */}
      <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
        <ul className="flex gap-4 md:gap-6 min-w-max">
          {products.map((product, index) => {
            const pricedProduct = pricedProductsMap.get(product.id!)
            // Only render if we have priced product data
            if (!pricedProduct) {
              return null
            }
            return (
              <li key={product.id} className="flex-shrink-0 w-[200px] md:w-[240px]">
                <ProductTile 
                  product={product} 
                  region={region}
                  countryCode={countryCode}
                  priority={index < 4} // Prioritize first 4 images for LCP
                  pricedProduct={pricedProduct}
                />
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
