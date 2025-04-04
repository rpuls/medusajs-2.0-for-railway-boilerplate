import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that an item that was added in an order edit can be removed.
 */
export type RemoveOrderEditItemActionValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The details of the item to be removed.
     */
    input: OrderWorkflow.DeleteOrderEditItemActionWorkflowInput;
};
/**
 * This step validates that an item that was added in the order edit can be removed
 * from the order edit. If the order is canceled or the order change is not active,
 * the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeOrderEditItemActionValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchact_123",
 *   }
 * })
 */
export declare const removeOrderEditItemActionValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveOrderEditItemActionValidationStepInput, unknown>;
export declare const removeItemOrderEditActionWorkflowId = "remove-item-order edit-action";
/**
 * This workflow removes an item that was added to an order edit. It's used by the
 * [Remove Item from Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_deleteordereditsiditemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove an item that was
 * added to an order edit in your custom flow.
 *
 * @example
 * const { result } = await removeItemOrderEditActionWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchact_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an item that was added to an order edit.
 */
export declare const removeItemOrderEditActionWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeleteOrderEditItemActionWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=remove-order-edit-item-action.d.ts.map