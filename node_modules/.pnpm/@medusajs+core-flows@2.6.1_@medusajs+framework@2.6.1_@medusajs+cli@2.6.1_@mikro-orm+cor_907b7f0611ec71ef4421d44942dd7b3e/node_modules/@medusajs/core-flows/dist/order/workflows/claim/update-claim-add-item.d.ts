import { OrderChangeDTO, OrderClaimDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that a claim's outbound item can be updated.
 */
export type UpdateClaimAddNewItemValidationStepInput = {
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
     * The details of updating the outbound item.
     */
    input: OrderWorkflow.UpdateClaimAddNewItemWorkflowInput;
};
/**
 * This step validates that a claim's new or outbound item can be updated.
 * If the order, claim, or order change is canceled, no action is adding the item,
 *  or the action is not adding an outbound item, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order claim, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateClaimAddItemValidationStep({
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
export declare const updateClaimAddItemValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateClaimAddNewItemValidationStepInput, unknown>;
export declare const updateClaimAddItemWorkflowId = "update-claim-add-item";
/**
 * This workflow updates a claim's new or outbound item. It's used by the
 * [Update Outbound Item API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidoutbounditemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update a claim's new or outbound item
 * in your custom flows.
 *
 * @example
 * const { result } = await updateClaimAddItemWorkflow(container)
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
 * Update a claim's new or outbound item.
 */
export declare const updateClaimAddItemWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.UpdateClaimAddNewItemWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=update-claim-add-item.d.ts.map