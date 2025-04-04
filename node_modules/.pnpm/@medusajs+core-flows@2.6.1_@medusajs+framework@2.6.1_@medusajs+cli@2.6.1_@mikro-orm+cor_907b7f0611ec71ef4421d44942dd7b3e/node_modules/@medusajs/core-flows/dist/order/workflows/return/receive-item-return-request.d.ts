import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a return's items can be marked as received.
 */
export type ReceiveItemReturnRequestValidationStepInput = {
    /**
     * The order's details.
     */
    order: Pick<OrderDTO, "id" | "items">;
    /**
     * The return's details.
     */
    orderReturn: ReturnDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The received items.
     */
    items: OrderWorkflow.ReceiveOrderReturnItemsWorkflowInput["items"];
};
/**
 * This step validates that a return's items can be marked as received.
 * If the order or return is canceled, the order change is not active,
 * or the items do not exist in the return, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = receiveItemReturnRequestValidationStep({
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
 *     // other return details...
 *   },
 *   items: [
 *     {
 *       id: "orli_123",
 *       quantity: 1,
 *     }
 *   ]
 * })
 */
export declare const receiveItemReturnRequestValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<ReceiveItemReturnRequestValidationStepInput, unknown>;
export declare const receiveItemReturnRequestWorkflowId = "receive-item-return-request";
/**
 * This workflow marks return items as received. It's used by the
 * [Add Received Items to Return Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsidreceiveitems).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to mark return items as received
 * in your custom flows.
 *
 * @example
 * const { result } = await receiveItemReturnRequestWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Mark return items as received.
 */
export declare const receiveItemReturnRequestWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.ReceiveOrderReturnItemsWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=receive-item-return-request.d.ts.map