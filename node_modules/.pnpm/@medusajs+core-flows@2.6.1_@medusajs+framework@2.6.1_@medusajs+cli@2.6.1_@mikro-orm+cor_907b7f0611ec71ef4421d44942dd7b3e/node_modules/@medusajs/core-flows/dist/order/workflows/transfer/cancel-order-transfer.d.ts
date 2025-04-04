import { OrderChangeDTO, OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The details of the order transfer cancellation to validate.
 */
export type CancelTransferOrderRequestValidationStep = {
    /**
     * The order to cancel the transfer request for.
     */
    order: OrderDTO;
    /**
     * The order change made by the transfer request.
     */
    orderChange: OrderChangeDTO;
    /**
     * The cancelation details.
     */
    input: OrderWorkflow.CancelTransferOrderRequestWorkflowInput;
};
/**
 * This step validates that a requested order transfer can be canceled.
 * If the customer canceling the order transfer isn't the one that requested the transfer,
 * the step throws an error. Admin users can cancel any order transfer.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = cancelTransferOrderRequestValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "order_change_123",
 *     // other order change details...
 *   },
 *   input: {
 *     order_id: "order_123",
 *     logged_in_user_id: "cus_123",
 *     actor_type: "customer"
 *   }
 * })
 */
export declare const cancelTransferOrderRequestValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<CancelTransferOrderRequestValidationStep, unknown>;
export declare const cancelTransferOrderRequestWorkflowId = "cancel-transfer-order-request";
/**
 * This workflow cancels a requested order transfer. This operation is allowed only by admin users and the customer that requested the transfer.
 * This workflow is used by the [Cancel Order Transfer Store API Route](https://docs.medusajs.com/api/store#orders_postordersidtransfercancel),
 * and the [Cancel Transfer Request Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidtransfercancel).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to build a custom flow
 * around canceling an order transfer.
 *
 * @example
 * const { result } = await cancelOrderTransferRequestWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     logged_in_user_id: "cus_123",
 *     actor_type: "customer"
 *   }
 * })
 *
 * @summary
 *
 * Cancel an order transfer request.
 */
export declare const cancelOrderTransferRequestWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.CancelTransferOrderRequestWorkflowInput, unknown, any[]>;
//# sourceMappingURL=cancel-order-transfer.d.ts.map