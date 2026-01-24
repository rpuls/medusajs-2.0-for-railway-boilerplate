import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"

export default function RecentlyVisited({
    region,
    products,
}: {
    region: HttpTypes.StoreRegion
    products: HttpTypes.StoreProduct[]
}) {
    if (!products || products.length === 0) {
        return null
    }

    return (
        <div className="flex flex-col gap-6 sm:gap-10">
            <div className="flex flex-col gap-2">
                <Heading
                    level="h2"
                    className="text-ui-fg-base font-heading text-2xl sm:text-4xl font-bold"
                >
                    Recently Viewed
                </Heading>
                <Text className="text-ui-fg-muted">
                    Pick up where you left off
                </Text>
            </div>
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <li key={product.id}>
                        <ProductPreview product={product} region={region} isFeatured />
                    </li>
                ))}
            </ul>
        </div>
    )
}

