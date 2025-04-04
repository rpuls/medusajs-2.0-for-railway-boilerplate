import { UpdateOrderExchangeDTO } from "@medusajs/framework/types";
export declare const updateOrderExchangesStepId = "update-order-exchange";
/**
 * This step updates one or more exchanges.
 *
 * @example
 * const data = updateOrderExchangesStep([{
 *   "id": "exchange_123",
 *   no_notification: true
 * }])
 */
export declare const updateOrderExchangesStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateOrderExchangeDTO[], import("@medusajs/framework/types").OrderExchangeDTO[]>;
//# sourceMappingURL=update-order-exchanges.d.ts.map