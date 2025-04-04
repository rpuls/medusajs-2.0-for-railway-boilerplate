import { OrderChangeActionDTO } from "@medusajs/framework/types";
/**
 * The details of creating the claim items from a change action.
 */
export type CreateOrderClaimItemsFromActionsInput = {
    /**
     * The change actions to create claim items from.
     */
    changes: OrderChangeActionDTO[];
    /**
     * The ID of the claim to create the items for.
     */
    claimId: string;
};
/**
 * This step creates claim items from a change action.
 *
 * :::note
 *
 * You can retrieve an order change action details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = createOrderClaimItemsFromActionsStep({
 *   claimId: "claim_123",
 *   changes: [
 *     {
 *       id: "orchact_123",
 *       // other order change action details...
 *     }
 *   ]
 * })
 */
export declare const createOrderClaimItemsFromActionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateOrderClaimItemsFromActionsInput, import("@medusajs/framework/types").OrderClaimItemDTO[]>;
//# sourceMappingURL=create-claim-items-from-actions.d.ts.map