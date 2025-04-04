import { OrderChangeDTO, OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
import { OrderPreviewDTO } from "@medusajs/types";
/**
 * The details of the order transfer acceptance to validate.
 */
export type AcceptOrderTransferValidationStepInput = {
    /**
     * The token of the order transfer.
     */
    token: string;
    /**
     * The order to accept the transfer for.
     */
    order: OrderDTO;
    /**
     * The order change made by the transfer request.
     */
    orderChange: OrderChangeDTO;
};
/**
 * This step validates that an order transfer can be accepted. If the
 * order doesn't have an existing transfer request, the step throws an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = acceptOrderTransferValidationStep({
 *   token: "sk_123456",
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "order_change_123",
 *     // other order change details...
 *   }
 * })
 */
export declare const acceptOrderTransferValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    token: string;
    order: OrderDTO;
    orderChange: OrderChangeDTO;
}, unknown>;
export declare const acceptOrderTransferWorkflowId = "accept-order-transfer-workflow";
/**
 * This workflow accepts an order transfer, requested previously by the {@link requestOrderTransferWorkflow}. This workflow is used by the
 * [Accept Order Transfer Store API Route](https://docs.medusajs.com/api/store#orders_postordersidtransferaccept).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to build a custom flow
 * around accepting an order transfer.
 *
 * @example
 * const { result } = await acceptOrderTransferWorkflow(container)
 * .run({
 *   input: {
 *     token: "sk_123456",
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Accept an order transfer request.
 */
export declare const acceptOrderTransferWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.AcceptOrderTransferWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=accept-order-transfer.d.ts.map