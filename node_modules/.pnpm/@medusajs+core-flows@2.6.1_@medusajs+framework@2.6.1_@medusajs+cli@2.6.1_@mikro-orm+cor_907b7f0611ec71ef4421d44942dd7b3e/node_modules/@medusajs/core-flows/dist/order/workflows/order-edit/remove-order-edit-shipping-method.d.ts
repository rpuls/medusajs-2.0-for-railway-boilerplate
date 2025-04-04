import { OrderChangeDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that a shipping method can be removed from an order edit.
 */
export type RemoveOrderEditShippingMethodValidationStepInput = {
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The details of the shipping method to be removed.
     */
    input: Pick<OrderWorkflow.DeleteOrderEditShippingMethodWorkflowInput, "order_id" | "action_id">;
};
/**
 * This step validates that a shipping method can be removed from an order edit.
 * If the order change is not active, the shipping method isn't in the exchange,
 * or the action doesn't add a shipping method, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeOrderEditShippingMethodValidationStep({
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
export declare const removeOrderEditShippingMethodValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveOrderEditShippingMethodValidationStepInput, unknown>;
export declare const removeOrderEditShippingMethodWorkflowId = "remove-order-edit-shipping-method";
/**
 * This workflow removes a shipping method of an order edit. It's used by the
 * [Remove Shipping Method Admin API Route](https://docs.medusajs.com/api/admin#order-edits_deleteordereditsidshippingmethodaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove a
 * shipping method from an order edit in your custom flows.
 *
 * @example
 * const { result } = await removeOrderEditShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchact_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove a shipping method from an order edit.
 */
export declare const removeOrderEditShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeleteOrderEditShippingMethodWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=remove-order-edit-shipping-method.d.ts.map