import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ProductEvents } from '@medusajs/framework/utils'
import { MeiliSearchService } from '@rokmohar/medusa-plugin-meilisearch'

export default async function productDeleteHandler({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
    const productId = data.id

    // Check if MeiliSearch service is available
    let meiliSearchService: MeiliSearchService
    try {
        meiliSearchService = container.resolve('@rokmohar/medusa-plugin-meilisearch')
    } catch (error) {
        // MeiliSearch service not available, skip deletion
        return
    }

    await meiliSearchService.deleteDocument('products', productId)
}

export const config: SubscriberConfig = {
    event: ProductEvents.PRODUCT_DELETED
}
