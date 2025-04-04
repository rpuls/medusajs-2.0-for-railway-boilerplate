import { OrderChangeDTO, OrderClaimDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that a claim's item can be updated.
 */
export type UpdateClaimItemValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The order claim's details.
     */
    orderClaim: OrderClaimDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The details of updating the item.
     */
    input: OrderWorkflow.UpdateClaimItemWorkflowInput;
};
/**
 * This step validates that a claim's item (added as an order item) can be updated.
 * If the order, claim, or order change is canceled, no action is claiming the item,
 * or the action is not claiming the item, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order claim, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateClaimItemValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
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
 *     data: {
 *       quantity: 1,
 *     }
 *   }
 * })
 */
export declare const updateClaimItemValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateClaimItemValidationStepInput, unknown>;
export declare const updateClaimItemWorkflowId = "update-claim-item";
/**
 * This workflow updates a claim item, added to the claim from an order item.
 * It's used by the [Update Claim Item Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidclaimitemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update a claim item
 * in your custom flows.
 *
 * @example
 * const { result } = await updateClaimItemWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     action_id: "orchact_123",
 *     data: {
 *       quantity: 1,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update a claim item, added to the claim from an order item.
 */
export declare const updateClaimItemWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateClaimItemWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=update-claim-item.d.ts.map