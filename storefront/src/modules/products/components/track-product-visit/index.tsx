"use client"

import { useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import {
    addRecentProduct,
    updateProductCategories,
    updateProductCollection,
} from "@lib/utils/personalization-cookies"

type TrackProductVisitProps = {
    product: HttpTypes.StoreProduct
}

export default function TrackProductVisit({ product }: TrackProductVisitProps) {
    useEffect(function trackProductVisit() {
        if (!product?.id) {
            return
        }

        // 1. Add product ID to recently viewed products array (max 10, FIFO)
        addRecentProduct(product.id)

        // 2. Update category_ids cookie with all product category IDs (comma-separated)
        if (product.categories && product.categories.length > 0) {
            const categoryIds = product.categories.map((category) => category.id)
            updateProductCategories(categoryIds)
        }

        // 3. Update collection_id cookie if product has a collection_id
        if (product.collection_id) {
            updateProductCollection(product.collection_id)
        }
    }, [product])

    return null
}

