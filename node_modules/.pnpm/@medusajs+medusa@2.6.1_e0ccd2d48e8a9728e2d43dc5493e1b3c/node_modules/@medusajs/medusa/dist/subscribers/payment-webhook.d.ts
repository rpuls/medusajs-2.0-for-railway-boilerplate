import { ProviderWebhookPayload } from "@medusajs/framework/types";
import { SubscriberArgs, SubscriberConfig } from "../types/subscribers";
export default function paymentWebhookhandler({ event, container, }: SubscriberArgs<ProviderWebhookPayload>): Promise<void>;
export declare const config: SubscriberConfig;
//# sourceMappingURL=payment-webhook.d.ts.map