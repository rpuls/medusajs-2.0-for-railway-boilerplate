import type { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import ShopByCategoryCard from "@modules/home/components/shop-by-category/shop-by-category-card"

type ShopByCategorySectionProps = {
    countryCode: string
    categories: HttpTypes.StoreProductCategory[]
}

const ShopByCategorySection = ({
    countryCode,
    categories,
}: ShopByCategorySectionProps) => {
    if (!categories.length) {
        return null
    }

    return (
        <div className="flex flex-col gap-6 sm:gap-10">
            <div className="flex flex-col gap-2">
                <Heading level="h2" className="text-ui-fg-base font-heading text-2xl sm:text-4xl font-bold">
                    Shop by Category
                </Heading>
                <Text className="text-ui-fg-muted">
                    Browse our curated collection of categories
                </Text>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {categories.slice(0, 8).map((category) => {
                    const href = `/categories/${category.handle}`
                    const image = (category.metadata as { image?: { url: string; alt?: string; width?: number; height?: number } } | null | undefined)?.image

                    return (
                        <ShopByCategoryCard
                            key={category.id}
                            href={href}
                            name={category.name}
                            description={category.description}
                            image={image}
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default ShopByCategorySection


