import { OrderChangeDTO, OrderClaimDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that a claim's shipping method can be removed.
 */
export type RemoveClaimShippingMethodValidationStepInput = {
    /**
     * The order claim's details.
     */
    orderClaim: OrderClaimDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The details of removing the shipping method.
     */
    input: Pick<OrderWorkflow.DeleteClaimShippingMethodWorkflowInput, "claim_id" | "action_id">;
};
/**
 * This step validates that a claim's shipping method can be removed.
 * If the claim or order change is canceled, the shipping method doesn't
 * exist in the claim, or the action is not adding a shipping method, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order claim and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeClaimShippingMethodValidationStep({
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderClaim: {
 *     id: "claim_123",
 *     // other order claim details...
 *   },
 *   input: {
 *     claim_id: "claim_123",
 *     action_id: "orchact_123",
 *   }
 * })
 */
export declare const removeClaimShippingMethodValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveClaimShippingMethodValidationStepInput, unknown>;
export declare const removeClaimShippingMethodWorkflowId = "remove-claim-shipping-method";
/**
 * This workflow removes an inbound (return) or outbound (delivery of new items) shipping method of a claim.
 * It's used by the [Remove Inbound Shipping Method](https://docs.medusajs.com/api/admin#claims_deleteclaimsidinboundshippingmethodaction_id),
 * or [Remove Outbound Shipping Method](https://docs.medusajs.com/api/admin#claims_deleteclaimsidoutboundshippingmethodaction_id) Admin API Routes.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove shipping methods from a claim
 * in your own custom flows.
 *
 * @example
 * const { result } = await removeClaimShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     action_id: "orchact_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an inbound or outbound shipping method from a claim.
 */
export declare const removeClaimShippingMethodWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeleteClaimShippingMethodWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=remove-claim-shipping-method.d.ts.map