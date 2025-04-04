import { OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a return can be canceled.
 */
export type CancelReturnValidateOrderInput = {
    /**
     * The order return's details.
     */
    orderReturn: ReturnDTO;
    /**
     * The data to cancel a return.
     */
    input: OrderWorkflow.CancelReturnWorkflowInput;
};
/**
 * This step validates that a return can be canceled.
 * If the return is canceled, its fulfillment aren't canceled,
 * or it has received items, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve a return details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = cancelReturnValidateOrder({
 *   orderReturn: {
 *     id: "return_123",
 *     // other order return details...
 *   },
 *   input: {
 *     return_id: "return_123"
 *   }
 * })
 */
export declare const cancelReturnValidateOrder: import("@medusajs/framework/workflows-sdk").StepFunction<CancelReturnValidateOrderInput, unknown>;
export declare const cancelReturnWorkflowId = "cancel-return";
/**
 * This workflow cancels a return. It's used by the
 * [Cancel Return Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsidcancel).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to cancel a return in your custom flow.
 *
 * @example
 * const { result } = await cancelReturnWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *   }
 * })
 *
 * @summary
 *
 * Cancel a return.
 */
export declare const cancelReturnWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.CancelReturnWorkflowInput, unknown, any[]>;
//# sourceMappingURL=cancel-return.d.ts.map