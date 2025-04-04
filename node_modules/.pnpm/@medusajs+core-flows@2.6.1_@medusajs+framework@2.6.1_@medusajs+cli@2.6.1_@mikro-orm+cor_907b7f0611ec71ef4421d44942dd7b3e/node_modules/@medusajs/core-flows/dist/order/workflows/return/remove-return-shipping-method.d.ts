import { OrderChangeDTO, OrderPreviewDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that a shipping method can be removed from a return.
 */
export type RemoveReturnShippingMethodValidationStepInput = {
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The return's details.
     */
    orderReturn: ReturnDTO;
    /**
     * The details of the shipping method to be removed.
     */
    input: Pick<OrderWorkflow.DeleteReturnShippingMethodWorkflowInput, "return_id" | "action_id">;
};
/**
 * This step validates that a shipping method can be removed from a return.
 * If the return is canceled, the order change is not active,
 * the shipping method isn't in the return,
 * or the action doesn't add a shipping method, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve a return and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeReturnShippingMethodValidationStep({
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
export declare const removeReturnShippingMethodValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveReturnShippingMethodValidationStepInput, unknown>;
export declare const removeReturnShippingMethodWorkflowId = "remove-return-shipping-method";
/**
 * This workflow removes a shipping method from a return. It's used by the
 * [Remove Shipping Method from Return Admin API Route](https://docs.medusajs.com/api/admin#returns_deletereturnsidshippingmethodaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to remove a shipping method from a return in your custom flows.
 *
 * @example
 * const { result } = await removeReturnShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     action_id: "orchac_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove a shipping method from a return.
 */
export declare const removeReturnShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeleteReturnShippingMethodWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=remove-return-shipping-method.d.ts.map