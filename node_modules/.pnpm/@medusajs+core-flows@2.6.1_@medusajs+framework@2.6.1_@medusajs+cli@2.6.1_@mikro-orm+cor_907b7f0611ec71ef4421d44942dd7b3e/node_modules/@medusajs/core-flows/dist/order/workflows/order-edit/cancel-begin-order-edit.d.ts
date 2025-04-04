import { OrderChangeDTO, OrderDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a requested order edit can be canceled.
 */
export type CancelBeginOrderEditValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
};
/**
 * This step validates that a requested order edit can be canceled.
 * If the order is canceled or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = cancelBeginOrderEditValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   }
 * })
 */
export declare const cancelBeginOrderEditValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<CancelBeginOrderEditValidationStepInput, unknown>;
/**
 * The data to cancel a requested order edit.
 */
export type CancelBeginOrderEditWorkflowInput = {
    /**
     * The ID of the order to cancel the edit for.
     */
    order_id: string;
};
export declare const cancelBeginOrderEditWorkflowId = "cancel-begin-order-edit";
/**
 * This workflow cancels a requested edit for an order. It's used by the
 * [Cancel Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_deleteordereditsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to cancel an order edit
 * in your custom flow.
 *
 * @example
 * const { result } = await cancelBeginOrderEditWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Cancel a requested order edit.
 */
export declare const cancelBeginOrderEditWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CancelBeginOrderEditWorkflowInput, unknown, any[]>;
//# sourceMappingURL=cancel-begin-order-edit.d.ts.map