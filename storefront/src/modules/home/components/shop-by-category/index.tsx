import type { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
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
        <section className="flex flex-col gap-8">
            <Heading level="h2" className="text-ui-fg-base font-heading text-3xl font-bold">
                Shop by Category
            </Heading>
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
        </section>
    )
}

export default ShopByCategorySection


