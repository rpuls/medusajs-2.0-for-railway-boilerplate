import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"
import { getTranslations, getTranslation } from "@lib/i18n/server"

interface FeaturedProductsProps {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
  title?: string
  titleKey?: string
  countryCode?: string
}

export default async function FeaturedProducts({
  collections,
  region,
  title,
  titleKey,
  countryCode = "us",
}: FeaturedProductsProps) {
  if (!collections || collections.length === 0) {
    return null
  }

  // Get translated title if titleKey is provided
  let displayTitle = title
  if (titleKey && !title) {
    const translations = await getTranslations(countryCode)
    displayTitle = getTranslation(translations, titleKey)
  }

  // If title/titleKey is provided, show only first collection with that title
  if (displayTitle && collections.length > 0) {
    return (
      <ProductRail
        collection={collections[0]}
        region={region}
        title={displayTitle}
        countryCode={countryCode}
      />
    )
  }

  // Otherwise show all collections
  return (
    <>
      {collections.map((collection) => (
        <ProductRail
          key={collection.id}
          collection={collection}
          region={region}
          countryCode={countryCode}
        />
      ))}
    </>
  )
}
