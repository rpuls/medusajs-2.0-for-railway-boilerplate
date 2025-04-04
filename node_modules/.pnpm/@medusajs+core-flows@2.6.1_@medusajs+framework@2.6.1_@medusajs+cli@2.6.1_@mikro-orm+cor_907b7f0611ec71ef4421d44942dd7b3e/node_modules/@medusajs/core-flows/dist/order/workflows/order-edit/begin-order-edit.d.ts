import { OrderChangeDTO, OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that an order-edit can be requested for an order.
 */
export type BeginOrderEditValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
};
/**
 * This step validates that an order-edit can be requested for an order.
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
 * const data = beginOrderEditValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   }
 * })
 */
export declare const beginOrderEditValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<BeginOrderEditValidationStepInput, unknown>;
export declare const beginOrderEditOrderWorkflowId = "begin-order-edit-order";
/**
 * This workflow creates an order edit request. It' used by the
 * [Create Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postorderedits).
 *
 * To request the order edit, use the {@link requestOrderEditRequestWorkflow}. The order edit is then only applied after the
 * order edit is confirmed using the {@link confirmOrderEditRequestWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to create an order edit
 * for an order in your custom flows.
 *
 * @example
 * const { result } = await beginOrderEditOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Create an order edit request.
 */
export declare const beginOrderEditOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.BeginorderEditWorkflowInput, OrderChangeDTO, []>;
//# sourceMappingURL=begin-order-edit.d.ts.map