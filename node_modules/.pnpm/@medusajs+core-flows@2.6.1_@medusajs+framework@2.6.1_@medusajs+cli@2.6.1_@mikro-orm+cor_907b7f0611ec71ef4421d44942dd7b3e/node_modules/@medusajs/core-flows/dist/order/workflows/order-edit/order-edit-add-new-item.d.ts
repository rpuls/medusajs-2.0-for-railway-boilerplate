import { OrderChangeDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that new items can be added to an order edit.
 */
export type OrderEditAddNewItemValidationStepInput = {
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
 * This step validates that new items can be added to an order edit.
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
 * const data = orderEditAddNewItemValidationStep({
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
export declare const orderEditAddNewItemValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<OrderEditAddNewItemValidationStepInput, unknown>;
export declare const orderEditAddNewItemWorkflowId = "order-edit-add-new-item";
/**
 * This workflow adds new items to an order edit. It's used by the
 * [Add Items to Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsiditems).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to add new items to an order edit
 * in your custom flows.
 *
 * @example
 * const { result } = await orderEditAddNewItemWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     items: [
 *       {
 *         variant_id: "variant_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Add new items to an order edit.
 */
export declare const orderEditAddNewItemWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.OrderEditAddNewItemWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=order-edit-add-new-item.d.ts.map