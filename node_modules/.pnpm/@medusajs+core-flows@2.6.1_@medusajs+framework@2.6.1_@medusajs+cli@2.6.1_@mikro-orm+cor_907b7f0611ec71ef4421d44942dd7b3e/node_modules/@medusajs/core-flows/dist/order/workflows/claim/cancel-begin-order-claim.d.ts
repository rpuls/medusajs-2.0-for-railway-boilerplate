import { OrderChangeDTO, OrderClaimDTO, OrderDTO } from "@medusajs/framework/types";
/**
 * The data to validate the cancelation of a requested order claim.
 */
export type CancelBeginOrderClaimValidationStepInput = {
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
 * This step validates that the requested claim can be canceled by checking that it's not canceled,
 * its order isn't canceled, and it hasn't been confirmed. If not valid, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order claim, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = cancelBeginOrderClaimValidationStep({
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
export declare const cancelBeginOrderClaimValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<CancelBeginOrderClaimValidationStepInput, unknown>;
/**
 * The data to cancel a requested order claim.
 */
export type CancelBeginOrderClaimWorkflowInput = {
    /**
     * The ID of the claim to cancel.
     */
    claim_id: string;
};
export declare const cancelBeginOrderClaimWorkflowId = "cancel-begin-order-claim";
/**
 * This workflow cancels a requested order claim. It's used by the
 * [Cancel Claim Request Admin API Route](https://docs.medusajs.com/api/admin#claims_deleteclaimsidrequest).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to cancel a claim
 * for an order in your custom flows.
 *
 * @example
 * const { result } = await cancelBeginOrderClaimWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *   }
 * })
 *
 * @summary
 *
 * Cancel a requested order claim.
 */
export declare const cancelBeginOrderClaimWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CancelBeginOrderClaimWorkflowInput, unknown, any[]>;
//# sourceMappingURL=cancel-begin-order-claim.d.ts.map