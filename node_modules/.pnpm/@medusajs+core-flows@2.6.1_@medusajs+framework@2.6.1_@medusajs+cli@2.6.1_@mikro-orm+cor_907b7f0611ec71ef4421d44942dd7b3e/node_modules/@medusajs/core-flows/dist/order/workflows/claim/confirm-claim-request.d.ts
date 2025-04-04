import { OrderChangeDTO, OrderClaimDTO, OrderDTO, OrderPreviewDTO } from "@medusajs/framework/types";
/**
 * The data to validate confirming a claim request.
 */
export type ConfirmClaimRequestValidationStepInput = {
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
 * This step validates that a requested claim can be confirmed. If the order or claim is canceled,
 * or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order claim, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = confirmClaimRequestValidationStep({
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
 * })
 */
export declare const confirmClaimRequestValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<ConfirmClaimRequestValidationStepInput, unknown>;
/**
 * The details of confirming the claim request.
 */
export type ConfirmClaimRequestWorkflowInput = {
    /**
     * The ID of the claim to confirm.
     */
    claim_id: string;
    /**
     * The ID of the user confirming the claim.
     */
    confirmed_by?: string;
};
export declare const confirmClaimRequestWorkflowId = "confirm-claim-request";
/**
 * This workflow confirms a requested claim. It's used by the
 * [Confirm Claim Request API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidrequest).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to confirm a claim
 * for an order in your custom flows.
 *
 * @example
 * const { result } = await confirmClaimRequestWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *   }
 * })
 *
 * @summary
 *
 * Confirm a requested claim.
 */
export declare const confirmClaimRequestWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<ConfirmClaimRequestWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=confirm-claim-request.d.ts.map