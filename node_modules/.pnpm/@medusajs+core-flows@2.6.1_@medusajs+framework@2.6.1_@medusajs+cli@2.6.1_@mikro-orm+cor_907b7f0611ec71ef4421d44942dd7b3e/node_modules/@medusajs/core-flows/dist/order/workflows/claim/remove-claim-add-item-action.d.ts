import { OrderChangeDTO, OrderClaimDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that outbound (new) items can be removed from a claim.
 */
export type RemoveClaimAddItemActionValidationStepInput = {
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
     * The details of removing the outbound items.
     */
    input: OrderWorkflow.DeleteOrderClaimItemActionWorkflowInput;
};
/**
 * This step validates that outbound (new) items can be removed from a claim.
 * If the order, claim, or order change is canceled, or the action is not adding an item, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order claim, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeClaimAddItemActionValidationStep({
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
export declare const removeClaimAddItemActionValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveClaimAddItemActionValidationStepInput, unknown>;
/**
 * The data to remove outbound (new) items from a claim.
 *
 * @property action_id - The ID of the action associated with the outbound items.
 * Every item has an `actions` property, whose value is an array of actions.
 * You can find the action name `ITEM_ADD` using its `action` property,
 * and use the value of its `id` property.
 */
export type RemoveAddItemClaimActionWorkflowInput = OrderWorkflow.DeleteOrderClaimItemActionWorkflowInput;
export declare const removeAddItemClaimActionWorkflowId = "remove-item-claim-add-action";
/**
 * This workflow removes outbound (new) items from a claim. It's used by the
 * [Remove Outbound Items Admin API Route](https://docs.medusajs.com/api/admin#claims_deleteclaimsidoutbounditemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove outbound items from a claim
 * in your custom flows.
 *
 * @example
 * const { result } = await removeAddItemClaimActionWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     action_id: "orchact_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove outbound (new) items from a claim.
 */
export declare const removeAddItemClaimActionWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.DeleteOrderClaimItemActionWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=remove-claim-add-item-action.d.ts.map