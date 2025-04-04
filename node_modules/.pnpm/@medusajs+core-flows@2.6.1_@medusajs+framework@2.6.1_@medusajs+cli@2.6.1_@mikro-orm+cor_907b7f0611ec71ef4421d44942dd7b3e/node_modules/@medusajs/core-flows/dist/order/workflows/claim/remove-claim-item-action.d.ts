import { OrderChangeDTO, OrderClaimDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that claim items can be removed.
 */
export type RemoveClaimItemActionValidationStepInput = {
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
     * The details of removing the claim items.
     */
    input: OrderWorkflow.DeleteOrderClaimItemActionWorkflowInput;
};
/**
 * This step confirms that a claim's items, added as order items, can be removed.
 * If the order, claim, or order change is canceled, or the action is not claiming an item, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order claim, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeClaimItemActionValidationStep({
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
 *   }
 * })
 */
export declare const removeClaimItemActionValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveClaimItemActionValidationStepInput, unknown>;
/**
 * The data to remove order items from a claim.
 *
 * @property action_id - The ID of the action associated with the outbound items.
 * Every item has an `actions` property, whose value is an array of actions.
 * You can find the action name `WRITE_OFF_ITEM` using its `action` property,
 * and use the value of its `id` property.
 */
export type RemoveItemClaimActionWorkflowInput = OrderWorkflow.DeleteOrderClaimItemActionWorkflowInput;
export declare const removeItemClaimActionWorkflowId = "remove-item-claim-action";
/**
 * This workflow removes order items from a claim. It's used by the
 * [Remove Claim Item Admin API Route](https://docs.medusajs.com/api/admin#claims_deleteclaimsidclaimitemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove order items from a claim
 * in your custom flows.
 *
 * @example
 * const { result } = await removeItemClaimActionWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     action_id: "orchact_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove order items from a claim.
 */
export declare const removeItemClaimActionWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeleteOrderClaimItemActionWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=remove-claim-item-action.d.ts.map