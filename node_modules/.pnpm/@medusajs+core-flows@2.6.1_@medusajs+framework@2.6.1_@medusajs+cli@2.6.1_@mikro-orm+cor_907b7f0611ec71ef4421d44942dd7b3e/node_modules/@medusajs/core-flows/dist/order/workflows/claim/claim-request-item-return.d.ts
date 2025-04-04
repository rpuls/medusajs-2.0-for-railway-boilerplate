import { OrderChangeDTO, OrderClaimDTO, OrderDTO, OrderPreviewDTO, OrderWorkflow, ReturnDTO } from "@medusajs/framework/types";
/**
 * The data to validate that items can be requested to return as part of a claim.
 */
export type OrderClaimRequestItemReturnValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
    /**
     * The order return's details.
     */
    orderReturn: ReturnDTO;
    /**
     * The order claim's details.
     */
    orderClaim: OrderClaimDTO;
    /**
     * The order change's details.
     */
    orderChange: OrderChangeDTO;
    /**
     * The items requested to return.
     */
    items: OrderWorkflow.OrderClaimRequestItemReturnWorkflowInput["items"];
};
/**
 * This step validates that items can be requested to return as part of a claim.
 * If the order, claim, or return is canceled, or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order claim, order return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = orderClaimRequestItemReturnValidationStep({
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
 *   orderReturn: {
 *     id: "return_123",
 *     // other order return details...
 *   },
 *   items: [
 *     {
 *       id: "orli_123",
 *       quantity: 1
 *     }
 *   ]
 * })
 */
export declare const orderClaimRequestItemReturnValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<OrderClaimRequestItemReturnValidationStepInput, unknown>;
export declare const orderClaimRequestItemReturnWorkflowId = "claim-request-item-return";
/**
 * This workflow requests one or more items to be returned as part of a claim. The
 * items are added to the claim as inbound items. The workflow is used by the
 * [Add Inbound Items to Claim Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidinbounditems).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to request items to be returned
 * as part of a claim in your custom flows.
 *
 * @example
 * const { result } = await orderClaimRequestItemReturnWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     return_id: "return_123",
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
 * Request one or more items to be returned as part of a claim.
 */
export declare const orderClaimRequestItemReturnWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.OrderClaimRequestItemReturnWorkflowInput, OrderPreviewDTO, []>;
//# sourceMappingURL=claim-request-item-return.d.ts.map