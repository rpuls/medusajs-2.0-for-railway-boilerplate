import { OrderChangeDTO, OrderClaimDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that claim items can be added to a claim.
 */
export type OrderClaimItemValidationStepInput = {
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
 * This step validates that claim items can be added to a claim. If the
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
 * const data = orderClaimItemValidationStep({
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
export declare const orderClaimItemValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    order: OrderDTO;
    orderClaim: OrderClaimDTO;
    orderChange: OrderChangeDTO;
}, unknown>;
export declare const orderClaimItemWorkflowId = "claim-item";
/**
 * This workflow adds order items to a claim as claim items. It's used by the
 * [Add Claim Items Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidclaimitems).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to add items to a claim
 * for an order in your custom flows.
 *
 * @example
 * const { result } = await orderClaimItemWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Add order items to a claim as claim items.
 */
export declare const orderClaimItemWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.OrderClaimItemWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=claim-item.d.ts.map