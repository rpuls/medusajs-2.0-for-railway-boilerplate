import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
export default function meilisearchProductCreatedHandler({ event: { data }, container, }: SubscriberArgs<{
    id: string;
}>): Promise<void>;
export declare const config: SubscriberConfig;
//# sourceMappingURL=meilisearch-product-created.d.ts.map