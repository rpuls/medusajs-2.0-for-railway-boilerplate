import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a return item can be removed.
 */
export type RemoveItemReturnActionValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The return's details.
     */
    orderReturn: ReturnDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The details of the item to be removed.
     */
    input: OrderWorkflow.DeleteRequestItemReturnWorkflowInput;
};
/**
 * This step validates that a return item can be removed.
 * If the order or return is canceled, the order change is not active,
 * the return request is not found,
 * or the action is not a request return action, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeReturnItemActionValidationStep({
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
 *   input: {
 *     return_id: "return_123",
 *     action_id: "orchac_123",
 *   }
 * })
 */
export declare const removeReturnItemActionValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveItemReturnActionValidationStepInput, unknown>;
export declare const removeItemReturnActionWorkflowId = "remove-item-return-action";
/**
 * This workflow removes a return item. It's used by the
 * [Remove Item from Return Admin API Route](https://docs.medusajs.com/api/admin#returns_deletereturnsidrequestitemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to remove an item from a return request in your custom flows.
 *
 * @example
 * const { result } = await removeItemReturnActionWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     action_id: "orchac_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an item from a return.
 */
export declare const removeItemReturnActionWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeleteRequestItemReturnWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=remove-item-return-action.d.ts.map