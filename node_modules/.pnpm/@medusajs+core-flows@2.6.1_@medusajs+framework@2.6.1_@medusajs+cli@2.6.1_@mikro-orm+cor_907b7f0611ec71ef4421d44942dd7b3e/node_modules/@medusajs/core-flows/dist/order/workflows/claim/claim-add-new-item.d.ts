import { OrderChangeDTO, OrderClaimDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate adding new items to a claim.
 */
export type OrderClaimAddNewItemValidationStepInput = {
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
};
/**
 * This step validates that new items can be added to the claim. If the
 * order or claim is canceled, or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order claim, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = orderClaimAddNewItemValidationStep({
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
 *   }
 * })
 */
export declare const orderClaimAddNewItemValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<OrderClaimAddNewItemValidationStepInput, unknown>;
export declare const orderClaimAddNewItemWorkflowId = "claim-add-new-item";
/**
 * This workflow adds outbound (or new) items to a claim. It's used by the
 * [Add Outbound Items Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidoutbounditems).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to add outbound items to a claim
 * in your custom flows.
 *
 * @example
 * const { result } = await orderClaimAddNewItemWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     items: [
 *       {
 *         variant_id: "variant_123",
 *         quantity: 1
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Add outbound or new items to a claim.
 */
export declare const orderClaimAddNewItemWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.OrderClaimAddNewItemWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=claim-add-new-item.d.ts.map