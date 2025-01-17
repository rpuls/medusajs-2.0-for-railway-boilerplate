import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import { IProductModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { ProductEvents, SearchUtils } from '@medusajs/framework/utils';
import { MeiliSearchService } from '@rokmohar/medusa-plugin-meilisearch';

export default async function productUpsertHandler({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  const productId = data.id;

  const productModuleService: IProductModuleService = container.resolve(Modules.PRODUCT);
  
  // Check if MeiliSearch service is available
  let meiliSearchService: MeiliSearchService;
  try {
    meiliSearchService = container.resolve('meilisearch');
  } catch (error) {
    return;
  }

  const product = await productModuleService.retrieveProduct(productId);
  await meiliSearchService.addDocuments('products', [product], SearchUtils.indexTypes.PRODUCTS);
}

export const config: SubscriberConfig = {
  event: [ProductEvents.PRODUCT_CREATED, ProductEvents.PRODUCT_UPDATED]
}
