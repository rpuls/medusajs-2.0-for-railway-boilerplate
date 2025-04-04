import { OrderChangeDTO, OrderExchangeDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that a shipping method can be removed from an exchange.
 */
export type RemoveExchangeShippingMethodValidationStepInput = {
    /**
     * The order exchange's details.
     */
    orderExchange: OrderExchangeDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The details of the action.
     */
    input: Pick<OrderWorkflow.DeleteExchangeShippingMethodWorkflowInput, "exchange_id" | "action_id">;
};
/**
 * This step validates that a shipping method can be removed from an exchange.
 * If the exchange is canceled, the order change is not active, the shipping method
 * doesn't exist, or the action isn't adding a shipping method, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order exchange and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeExchangeShippingMethodValidationStep({
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderExchange: {
 *     id: "exchange_123",
 *     // other order exchange details...
 *   },
 *   input: {
 *     exchange_id: "exchange_123",
 *     action_id: "orchact_123",
 *   }
 * })
 */
export declare const removeExchangeShippingMethodValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveExchangeShippingMethodValidationStepInput, unknown>;
export declare const removeExchangeShippingMethodWorkflowId = "remove-exchange-shipping-method";
/**
 * This workflow removes an inbound or outbound shipping method of an exchange. It's used by the
 * [Remove Inbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#exchanges_deleteexchangesidinboundshippingmethodaction_id) or
 * the [Remove Outbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#exchanges_deleteexchangesidoutboundshippingmethodaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove an inbound or outbound shipping method
 * from an exchange in your custom flow.
 *
 * @example
 * const { result } = await removeExchangeShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *     action_id: "orchact_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an inbound or outbound shipping method from an exchange.
 */
export declare const removeExchangeShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeleteExchangeShippingMethodWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=remove-exchange-shipping-method.d.ts.map