import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a return receival can be confirmed.
 */
export type ConfirmReceiveReturnValidationStepInput = {
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
 * This step validates that a return receival can be confirmed.
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
 * const data = confirmReceiveReturnValidationStep({
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
export declare const confirmReceiveReturnValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<ConfirmReceiveReturnValidationStepInput, unknown>;
/**
 * The data to confirm a return receival request.
 */
export type ConfirmReceiveReturnRequestWorkflowInput = {
    /**
     * The ID of the return to confirm the receival for.
     */
    return_id: string;
    /**
     * The ID of the user that's confirming the return receival.
     */
    confirmed_by?: string;
};
export declare const confirmReturnReceiveWorkflowId = "confirm-return-receive";
/**
 * This workflow confirms a return receival request. It's used by the
 * [Confirm Return Receival Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsidreceiveconfirm).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to confirm a return receival in your custom flow.
 *
 * @example
 * const { result } = await confirmReturnReceiveWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *   }
 * })
 *
 * @summary
 *
 * Confirm a return receival request.
 */
export declare const confirmReturnReceiveWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<ConfirmReceiveReturnRequestWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=confirm-receive-return-request.d.ts.map