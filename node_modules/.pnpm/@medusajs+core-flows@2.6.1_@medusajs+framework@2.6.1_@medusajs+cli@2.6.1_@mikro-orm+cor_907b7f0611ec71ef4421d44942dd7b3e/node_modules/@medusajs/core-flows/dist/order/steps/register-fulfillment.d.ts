import { RegisterOrderFulfillmentDTO } from "@medusajs/framework/types";
export declare const registerOrderFulfillmentStepId = "register-order-fullfillment";
/**
 * This step registers a fulfillment for an order.
 *
 * @example
 * const data = registerOrderFulfillmentStep({
 *   order_id: "order_123",
 *   items: [{
 *     id: "item_123",
 *     quantity: 1
 *   }],
 * })
 */
export declare const registerOrderFulfillmentStep: import("@medusajs/framework/workflows-sdk").StepFunction<RegisterOrderFulfillmentDTO, undefined>;
//# sourceMappingURL=register-fulfillment.d.ts.map