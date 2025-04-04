import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
export default function meilisearchProductUpdatedHandler({ event: { data }, container, }: SubscriberArgs<{
    id: string;
}>): Promise<void>;
export declare const config: SubscriberConfig;
//# sourceMappingURL=meilisearch-product-updated.d.ts.map