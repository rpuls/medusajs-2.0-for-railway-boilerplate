import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that a new item can be updated in an order edit.
 */
export type UpdateOrderEditAddItemValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The details of the item to be updated.
     */
    input: OrderWorkflow.UpdateOrderEditAddNewItemWorkflowInput;
};
/**
 * This step validates that a new item can be updated in an order edit.
 * If the order is canceled, the order change is not active,
 * the item isn't in the order edit, or the action isn't adding an item,
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
 * const data = updateOrderEditAddItemValidationStep({
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
 *     action_id: "orchac_123",
 *     data: {
 *       quantity: 1,
 *     }
 *   }
 * })
 */
export declare const updateOrderEditAddItemValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateOrderEditAddItemValidationStepInput, unknown>;
export declare const updateOrderEditAddItemWorkflowId = "update-order-edit-add-item";
/**
 * This workflow updates a new item in an order edit. It's used by the
 * [Update Item Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsiditemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update a new item in an order edit
 * in your custom flows.
 *
 * @example
 * const { result } = await updateOrderEditAddItemWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchac_123",
 *     data: {
 *       quantity: 1,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update a new item in an order edit.
 */
export declare const updateOrderEditAddItemWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateOrderEditAddNewItemWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=update-order-edit-add-item.d.ts.map