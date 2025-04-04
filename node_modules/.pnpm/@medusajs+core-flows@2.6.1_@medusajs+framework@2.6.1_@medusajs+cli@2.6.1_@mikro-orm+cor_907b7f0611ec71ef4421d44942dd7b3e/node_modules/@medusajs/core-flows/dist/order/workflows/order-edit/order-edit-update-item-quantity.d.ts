import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that the quantity of an existing item in an order can be updated in an order edit.
 */
export type OrderEditUpdateItemQuantityValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
};
/**
 * This step validates that the quantity of an existing item in an order can be updated in an order edit.
 * If the order is canceled or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = orderEditUpdateItemQuantityValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   }
 * })
 */
export declare const orderEditUpdateItemQuantityValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<OrderEditUpdateItemQuantityValidationStepInput, unknown>;
export declare const orderEditUpdateItemQuantityWorkflowId = "order-edit-update-item-quantity";
/**
 * This workflow updates the quantity of an existing item in an order's edit. It's used by the
 * [Update Order Item Quantity Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsiditemsitemitem_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update the quantity of an existing
 * item in an order's edit in your custom flow.
 *
 * @example
 * const { result } = await orderEditUpdateItemQuantityWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 2,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update the quantity of an existing order item in the order's edit.
 */
export declare const orderEditUpdateItemQuantityWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.OrderEditUpdateItemQuantityWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=order-edit-update-item-quantity.d.ts.map