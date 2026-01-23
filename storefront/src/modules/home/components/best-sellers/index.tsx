import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"
import { getBestSellers } from "@lib/data/best-sellers"
import {
    getPersonalizationCategoryIds,
    getPersonalizationCollectionId,
} from "@lib/data/cookies"

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
    // Read personalization cookies
    const cookieCategoryIds = await getPersonalizationCategoryIds()
    const cookieCollectionId = await getPersonalizationCollectionId()

    // Use cookie values if available, otherwise fall back to props
    const categoryIds = cookieCategoryIds.length > 0 ? cookieCategoryIds : categoryId ? [categoryId] : undefined
    const finalCollectionId = cookieCollectionId || collectionId

    const products = await getBestSellers({
        category_ids: categoryIds,
        collection_id: finalCollectionId,
        regionId: region.id,
        limit,
    })

    if (!products || products.length === 0) {
        return null
    }


    return (
        <div className="flex flex-col gap-6 sm:gap-10">
            <Heading level="h2" className="text-ui-fg-base font-heading text-2xl sm:text-4xl font-bold">
                Best Sellers
            </Heading>
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {products.map((product) => (
                    <li key={product.id}>
                        <ProductPreview product={product} region={region} isFeatured />
                    </li>
                ))}
            </ul>
        </div>
    )
}

