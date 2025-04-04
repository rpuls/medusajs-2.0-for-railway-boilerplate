import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
export default function meilisearchProductDeletedHandler({ event: { data }, container, }: SubscriberArgs<{
    id: string;
}>): Promise<void>;
export declare const config: SubscriberConfig;
//# sourceMappingURL=meilisearch-product-deleted.d.ts.map