import { OrderChangeDTO, OrderDTO, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a return receival can be canceled.
 */
export type CancelReceiveReturnValidationStepInput = {
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
 * This step validates that a return receival can be canceled.
 * If the order or return is canceled, or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = cancelReceiveReturnValidationStep({
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
export declare const cancelReceiveReturnValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<CancelReceiveReturnValidationStepInput, unknown>;
/**
 * The data to cancel a return receival.
 */
export type CancelReturnReceiveWorkflowInput = {
    /**
     * The ID of the return to cancel the receival for.
     */
    return_id: string;
};
export declare const cancelReturnReceiveWorkflowId = "cancel-receive-return";
/**
 * This workflow cancels a return receival. It's used by the
 * [Cancel Return Receival Admin API Route](https://docs.medusajs.com/api/admin#returns_deletereturnsidreceive).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to cancel a return receival in your custom flow.
 *
 * @example
 * const { result } = await cancelReturnReceiveWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *   }
 * })
 *
 * @summary
 *
 * Cancel a return receival.
 */
export declare const cancelReturnReceiveWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CancelReturnReceiveWorkflowInput, unknown, any[]>;
//# sourceMappingURL=cancel-receive-return.d.ts.map