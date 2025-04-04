import { CancelOrderFulfillmentDTO } from "@medusajs/framework/types";
export declare const cancelOrderFulfillmentStepId = "cancel-order-fulfillment";
/**
 * This step cancels an order's fulfillment.
 *
 * @example
 * const data = cancelOrderFulfillmentStep({
 *   order_id: "order_123",
 *   items: [
 *     {
 *       id: "item_123",
 *       quantity: 1
 *     }
 *   ]
 * })
 */
export declare const cancelOrderFulfillmentStep: import("@medusajs/framework/workflows-sdk").StepFunction<CancelOrderFulfillmentDTO, undefined>;
//# sourceMappingURL=cancel-fulfillment.d.ts.map