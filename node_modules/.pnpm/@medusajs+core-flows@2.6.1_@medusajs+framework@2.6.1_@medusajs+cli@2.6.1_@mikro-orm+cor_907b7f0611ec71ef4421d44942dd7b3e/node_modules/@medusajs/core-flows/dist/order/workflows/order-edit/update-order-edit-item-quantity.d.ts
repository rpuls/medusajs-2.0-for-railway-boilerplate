import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that an existing order item can be updated in an order edit.
 */
export type UpdateOrderEditItemQuantityValidationStepInput = {
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
    input: OrderWorkflow.UpdateOrderEditItemQuantityWorkflowInput;
};
/**
 * This step validates that an existing order item can be updated in an order edit.
 * If the order is canceled, the order change is not active,
 * the item isn't in the order edit, or the action isn't updating an existing item,
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
 * const data = updateOrderEditItemQuantityValidationStep({
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
export declare const updateOrderEditItemQuantityValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateOrderEditItemQuantityValidationStepInput, unknown>;
export declare const updateOrderEditItemQuantityWorkflowId = "update-order-edit-update-quantity";
/**
 * This workflow updates an existing order item that was previously added to the order edit.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update the quantity
 * of an existing item in an order edit in your custom flows.
 *
 * @example
 * const { result } = await updateOrderEditItemQuantityWorkflow(container)
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
 * Update an existing order item previously added to an order edit.
 */
export declare const updateOrderEditItemQuantityWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateOrderEditItemQuantityWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=update-order-edit-item-quantity.d.ts.map