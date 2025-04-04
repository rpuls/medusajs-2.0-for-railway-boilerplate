import { OrderChangeDTO, OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that an exchange can be requested for an order.
 */
export type BeginOrderExchangeValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
};
/**
 * This step validates that an exchange can be requested for an order.
 * If the order is canceled, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = beginOrderExchangeValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 * })
 */
export declare const beginOrderExchangeValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<BeginOrderExchangeValidationStepInput, unknown>;
export declare const beginExchangeOrderWorkflowId = "begin-exchange-order";
/**
 * This workflow requests an order exchange. It's used by the
 * [Create Exchange Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchanges).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to request an exchange
 * for an order in your custom flow.
 *
 * @example
 * const { result } = await beginExchangeOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Request an order exchange.
 */
export declare const beginExchangeOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.BeginOrderExchangeWorkflowInput, OrderChangeDTO, []>;
//# sourceMappingURL=begin-order-exchange.d.ts.map