import { OrderChangeDTO, OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that a return can be created for an order.
 */
export type BeginReturnOrderValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
};
/**
 * This step validates that a return can be created for an order.
 * If the order is canceled, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = beginReturnOrderValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   }
 * })
 */
export declare const beginReturnOrderValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<BeginReturnOrderValidationStepInput, unknown>;
export declare const beginReturnOrderWorkflowId = "begin-return-order";
/**
 * This workflow creates an order return that can be later requested or confirmed.
 * It's used by the [Create Return Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturns).
 *
 * You can start the return receival using the {@link beginReceiveReturnWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to create a return for an order in your custom flow.
 *
 * @example
 * const { result } = await beginReturnOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123"
 *   }
 * })
 *
 * @summary
 *
 * Create a return for an order.
 */
export declare const beginReturnOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.BeginOrderReturnWorkflowInput, OrderChangeDTO, []>;
//# sourceMappingURL=begin-return.d.ts.map