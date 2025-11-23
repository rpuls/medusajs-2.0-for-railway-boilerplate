import { HttpTypes } from "@medusajs/types"
import dynamic from "next/dynamic"
import { getTranslations, getTranslation } from "@lib/i18n/server"

import InteractiveLink from "@modules/common/components/interactive-link"

// Lazy load product preview for better performance
const ProductPreview = dynamic(
  () => import("@modules/products/components/product-preview"),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="bg-gray-200 aspect-[11/14] rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ),
  }
)

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
          {products.map((product) => (
            <li key={product.id} className="flex-shrink-0 w-[200px] md:w-[240px]">
              {/* @ts-ignore */}
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
