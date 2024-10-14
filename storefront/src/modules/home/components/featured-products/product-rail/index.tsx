import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const { products } = collection

  console.log("produse noi",products)

  if (!products) {
    return null
  }



  return (
    <div className="content-container py-12 small:py-24">
      <div className="flex justify-between mb-8 text-red-400">
        <Text className="txt-xlarge">{collection.title}</Text>
        <InteractiveLink href={`/collections/${collection.handle}`} >
          Vezi mai multe
        </InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-6 gap-y-24 small:gap-y-36">
        {products &&
          products.map((product) => (
            <li key={product.id}>
              {/* @ts-ignore */}
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
