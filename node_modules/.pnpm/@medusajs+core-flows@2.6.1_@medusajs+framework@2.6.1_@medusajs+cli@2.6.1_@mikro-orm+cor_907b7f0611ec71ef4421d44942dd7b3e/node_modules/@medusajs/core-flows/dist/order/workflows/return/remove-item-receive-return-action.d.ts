import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a return receival's item can be removed.
 */
export type RemoveItemReceiveReturnActionValidationStepInput = {
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
    input: OrderWorkflow.DeleteRequestItemReceiveReturnWorkflowInput;
};
/**
 * This step validates that a return receival's item can be removed.
 * If the order or return is canceled, the order change is not active,
 * the return request is not found,
 * or the action is not a receive return action, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeItemReceiveReturnActionValidationStep({
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
export declare const removeItemReceiveReturnActionValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveItemReceiveReturnActionValidationStepInput, unknown>;
export declare const removeItemReceiveReturnActionWorkflowId = "remove-item-receive-return-action";
/**
 * This workflow removes an item from a return receival. It's used by the
 * [Remove a Received Item from Return Admin API Route](https://docs.medusajs.com/api/admin#returns_deletereturnsidreceiveitemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove an item from a return receival
 * in your custom flow.
 *
 * @example
 * const { result } = await removeItemReceiveReturnActionWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     action_id: "orchac_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an item from a return receival.
 */
export declare const removeItemReceiveReturnActionWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeleteRequestItemReceiveReturnWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=remove-item-receive-return-action.d.ts.map