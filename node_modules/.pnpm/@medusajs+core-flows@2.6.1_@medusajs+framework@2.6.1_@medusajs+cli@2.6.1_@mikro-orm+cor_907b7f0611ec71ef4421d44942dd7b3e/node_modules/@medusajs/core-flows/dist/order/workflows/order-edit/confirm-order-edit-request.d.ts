import { OrderChangeDTO, OrderDTO, OrderPreviewDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a requested order edit can be confirmed.
 */
export type ConfirmOrderEditRequestValidationStepInput = {
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
 * This step validates that a requested order edit can be confirmed.
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
 * const data = confirmOrderEditRequestValidationStep({
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
export declare const confirmOrderEditRequestValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<ConfirmOrderEditRequestValidationStepInput, unknown>;
/**
 * The data to confirm an order edit request.
 */
export type ConfirmOrderEditRequestWorkflowInput = {
    /**
     * The ID of the order to confirm the edit for.
     */
    order_id: string;
    /**
     * The ID of the user confirming the edit.
     */
    confirmed_by?: string;
};
export declare const confirmOrderEditRequestWorkflowId = "confirm-order-edit-request";
/**
 * This workflow confirms an order edit request. It's used by the
 * [Confirm Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsidconfirm).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to confirm an order edit
 * in your custom flow.
 *
 * @example
 * const { result } = await confirmOrderEditRequestWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Confirm an order edit request.
 */
export declare const confirmOrderEditRequestWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<ConfirmOrderEditRequestWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=confirm-order-edit-request.d.ts.map