import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a return request can be confirmed.
 */
export type ConfirmReturnRequestValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The order return's details.
     */
    orderReturn: ReturnDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
};
/**
 * This step validates that a return request can be confirmed.
 * If the order or return is canceled or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order change, and return details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = confirmReturnRequestValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other order return details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   }
 * })
 */
export declare const confirmReturnRequestValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<ConfirmReturnRequestValidationStepInput, unknown>;
/**
 * The details of confirming a return request.
 */
export type ConfirmReturnRequestWorkflowInput = {
    /**
     * The ID of the return to confirm its request.
     */
    return_id: string;
    /**
     * The ID of the user confirming the return request.
     */
    confirmed_by?: string;
};
export declare const confirmReturnRequestWorkflowId = "confirm-return-request";
/**
 * This workflow confirms a return request. It's used by the
 * [Confirm Return Request Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsidrequest).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to confirm a return request
 * in your custom flow.
 *
 * @example
 * const { result } = await confirmReturnRequestWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *   }
 * })
 *
 * @summary
 *
 * Confirm a return request.
 */
export declare const confirmReturnRequestWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<ConfirmReturnRequestWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=confirm-return-request.d.ts.map