import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a return request can have its items dismissed.
 */
export type DismissItemReturnRequestValidationStepInput = {
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
     * The items to dismiss.
     */
    items: OrderWorkflow.ReceiveOrderReturnItemsWorkflowInput["items"];
};
/**
 * This step validates that a return request can have its items dismissed.
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
 * const data = dismissItemReturnRequestValidationStep({
 *   order: {
 *     id: "order_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         // other item details...
 *       }
 *     ]
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other return details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   items: [
 *     {
 *       id: "orli_123",
 *       quantity: 1,
 *     }
 *   ]
 * })
 */
export declare const dismissItemReturnRequestValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<DismissItemReturnRequestValidationStepInput, unknown>;
/**
 * The data to dismiss items from a return request.
 *
 * @property return_id - The ID of the return to dismiss items from.
 * @property items - The items to dismiss.
 */
export type DismissItemReturnRequestWorkflowInput = OrderWorkflow.ReceiveOrderReturnItemsWorkflowInput;
export declare const dismissItemReturnRequestWorkflowId = "dismiss-item-return-request";
/**
 * This workflow dismisses items from a return request due to them being damaged. It's used
 * by the [Add Damaged Items Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsiddismissitems).
 *
 * A damaged item's quantity is dismissed, meaning it's not returned to the inventory.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to dismiss items from a return request in your custom flow.
 *
 * @example
 * const { result } = await dismissItemReturnRequestWorkflow(container)
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
 * Dismiss items from a return request.
 */
export declare const dismissItemReturnRequestWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.ReceiveOrderReturnItemsWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=dismiss-item-return-request.d.ts.map