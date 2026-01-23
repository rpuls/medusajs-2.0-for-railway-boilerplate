import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getProductsById } from "./products"

export type ProductSales = {
    id: string
    product_id: string
    category_id?: string | null
    collection_id?: string | null
    selling_count: number
}

export type BestSellersResponse = {
    product_sales: ProductSales[]
    count?: number
    limit?: number
    offset?: number
}

export const getBestSellers = cache(async function ({
    category_ids,
    collection_id,
    regionId,
    limit = 12,
    offset = 0,
}: {
    category_ids?: string[]
    collection_id?: string
    regionId: string
    limit?: number
    offset?: number
}): Promise<HttpTypes.StoreProduct[]> {
    try {
        const queryParams: any = {
            limit,
            offset,
        }

        // category_ids takes priority over collection_id
        if (category_ids && category_ids.length > 0) {
            queryParams.category_ids = category_ids
        } else if (collection_id) {
            queryParams.collection_id = collection_id
        }

        const response = await sdk.client.fetch<BestSellersResponse>(
            "/store/best-sellers",
            {
                query: queryParams,
                next: { tags: ["best-sellers"] },
            }
        )

        if (!response?.product_sales || response.product_sales.length === 0) {
            return []
        }

        // Extract product IDs and fetch products with variants and pricing
        const productIds = response.product_sales.map((ps) => ps.product_id)
        const products = await getProductsById({ ids: productIds, regionId })

        return products || []
    } catch (error) {
        console.error("Error fetching best sellers:", error)
        return []
    }
})

