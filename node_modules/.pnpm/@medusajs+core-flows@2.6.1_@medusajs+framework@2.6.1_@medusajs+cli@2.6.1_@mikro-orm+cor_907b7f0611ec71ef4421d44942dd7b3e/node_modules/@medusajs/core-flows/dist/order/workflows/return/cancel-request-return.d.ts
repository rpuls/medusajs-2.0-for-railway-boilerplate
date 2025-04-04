import { OrderChangeDTO, OrderDTO, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a requested return can be canceled.
 */
export type CancelRequestReturnValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The order return's details.
     */
    orderReturn: ReturnDTO;
};
/**
 * This step validates that a requested return can be canceled.
 * If the order or return is canceled, or the order change is not active,
 * the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = cancelRequestReturnValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other order return details...
 *   }
 * })
 */
export declare const cancelRequestReturnValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<CancelRequestReturnValidationStepInput, unknown>;
/**
 * The data to cancel a requested return.
 */
export type CancelRequestReturnWorkflowInput = {
    /**
     * The ID of the return to cancel.
     */
    return_id: string;
};
export declare const cancelReturnRequestWorkflowId = "cancel-return-request";
/**
 * This workflow cancels a requested return. It's used by the
 * [Cancel Return Request API Route](https://docs.medusajs.com/api/admin#returns_deletereturnsidrequest).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to cancel a return request in your custom flow.
 *
 * @example
 * const { result } = await cancelReturnRequestWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *   }
 * })
 *
 * @summary
 *
 * Cancel a requested return.
 */
export declare const cancelReturnRequestWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CancelRequestReturnWorkflowInput, unknown, any[]>;
//# sourceMappingURL=cancel-request-return.d.ts.map