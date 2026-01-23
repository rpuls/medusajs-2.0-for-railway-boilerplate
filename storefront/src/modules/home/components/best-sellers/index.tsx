import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"
import { getBestSellers } from "@lib/data/best-sellers"

export default async function BestSellers({
    region,
    categoryId,
    collectionId,
    limit = 12,
}: {
    region: HttpTypes.StoreRegion
    categoryId?: string
    collectionId?: string
    limit?: number
}) {
    const products = await getBestSellers({
        category_id: categoryId,
        collection_id: collectionId,
        regionId: region.id,
        limit,
    })

    if (!products || products.length === 0) {
        return null
    }

    const title = categoryId
        ? "Best Sellers in Category"
        : collectionId
            ? "Best Sellers in Collection"
            : "Best Sellers"

    return (
        <div className="flex flex-col gap-6 sm:gap-10">
            <Heading level="h2" className="text-ui-fg-base font-heading text-2xl sm:text-4xl font-bold">
                {title}
            </Heading>
            <ul className="grid grid-cols-2 small:grid-cols-4 gap-6">
                {products.map((product) => (
                    <li key={product.id}>
                        <ProductPreview product={product} region={region} isFeatured />
                    </li>
                ))}
            </ul>
        </div>
    )
}

