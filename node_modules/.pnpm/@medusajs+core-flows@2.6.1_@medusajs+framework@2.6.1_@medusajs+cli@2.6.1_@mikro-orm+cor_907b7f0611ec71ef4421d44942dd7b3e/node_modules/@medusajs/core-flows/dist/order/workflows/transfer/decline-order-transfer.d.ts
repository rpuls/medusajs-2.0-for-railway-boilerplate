import { OrderChangeDTO, OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The details of the order transfer decline to validate.
 */
export type DeclineTransferOrderRequestValidationStepInput = {
    /**
     * The order to decline the transfer request for.
     */
    order: OrderDTO;
    /**
     * The order change made by the transfer request.
     */
    orderChange: OrderChangeDTO;
    /**
     * The decline details.
     */
    input: OrderWorkflow.DeclineTransferOrderRequestWorkflowInput;
};
/**
 * This step validates that a requested order transfer can be declineed.
 * If the provided token doesn't match the token of the transfer request,
 * the step throws an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = declineTransferOrderRequestValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "order_change_123",
 *     // other order change details...
 *   },
 *   input: {
 *     token: "token_123",
 *     order_id: "order_123",
 *   }
 * })
 */
export declare const declineTransferOrderRequestValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<DeclineTransferOrderRequestValidationStepInput, unknown>;
export declare const declineTransferOrderRequestWorkflowId = "decline-transfer-order-request";
/**
 * This workflow declines a requested order transfer by its token. It's used by the
 * [Decline Order Transfer Store API Route](https://docs.medusajs.com/api/store#orders_postordersidtransferdecline).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around declining an order transfer request.
 *
 * @example
 * const { result } = await declineOrderTransferRequestWorkflow(container)
 * .run({
 *   input: {
 *     token: "token_123",
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Decline a requested order transfer.
 */
export declare const declineOrderTransferRequestWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeclineTransferOrderRequestWorkflowInput, unknown, any[]>;
//# sourceMappingURL=decline-order-transfer.d.ts.map