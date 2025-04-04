import { OrderChangeDTO, OrderPreviewDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a return can be updated.
 */
export type UpdateReturnValidationStepInput = {
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The return's details.
     */
    orderReturn: ReturnDTO;
};
/**
 * This step validates that a return can be updated.
 * If the return is canceled or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve a return and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateReturnValidationStep({
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other return details...
 *   },
 * })
 */
export declare const updateReturnValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateReturnValidationStepInput, unknown>;
export declare const updateReturnWorkflowId = "update-return";
/**
 * This workflow updates a return's details. It's used by the
 * [Update Return Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to update a return in your custom flow.
 *
 * @example
 * const { result } = await updateReturnWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     no_notification: true
 *   }
 * })
 *
 * @summary
 *
 * Update a return's details.
 */
export declare const updateReturnWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateReturnWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=update-return.d.ts.map