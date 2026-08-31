import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

import { getProductsList } from "@lib/data/products"
import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

/**
 * Homepage fallback for stores that have no collections yet.
 *
 * The featured section is driven entirely by collections, but the seed script
 * creates categories only, so a freshly deployed store had a hero and then an
 * empty page. This shows the newest products instead, so the homepage is never
 * blank while the store still has products.
 */
export default async function LatestProducts({
  countryCode,
  region,
}: {
  countryCode: string
  region: HttpTypes.StoreRegion
}) {
  const { response } = await getProductsList({
    queryParams: { limit: 6 },
    countryCode,
  })

  if (!response.products.length) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-24">
      <div className="flex justify-between mb-8">
        <Text className="txt-xlarge">Latest products</Text>
        <InteractiveLink href="/store">View all</InteractiveLink>
      </div>
      <ul
        className="grid grid-cols-2 small:grid-cols-3 gap-x-6 gap-y-24 small:gap-y-36"
        data-testid="latest-products"
      >
        {response.products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}
