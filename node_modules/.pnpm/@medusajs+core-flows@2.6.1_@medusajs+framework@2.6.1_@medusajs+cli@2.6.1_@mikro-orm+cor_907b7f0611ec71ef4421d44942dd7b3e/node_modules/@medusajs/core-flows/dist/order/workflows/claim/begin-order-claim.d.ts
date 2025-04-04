import { OrderChangeDTO, OrderDTO, OrderWorkflow } from "@medusajs/framework/types";
/**
 * The data to validate that an order can have a claim
 */
export type BeginClaimOrderValidationStepInput = {
    /**
     * The order's details.
     */
    order: OrderDTO;
};
/**
 * This step validates that the order associated with the claim isn't canceled.
 * If not valid, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = beginClaimOrderValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 * })
 */
export declare const beginClaimOrderValidationStep: import("@medusajs/framework/workflows-sdk").StepFunction<BeginClaimOrderValidationStepInput, unknown>;
export declare const beginClaimOrderWorkflowId = "begin-claim-order";
/**
 * This workflow creates an order claim in requested state. It's used by the
 * [Create Claim Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaims).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to create a claim
 * for an order in your custom flows.
 *
 * @example
 * const { result } = await beginClaimOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     type: "refund",
 *   }
 * })
 *
 * @summary
 *
 * Create an order claim in requested state.
 */
export declare const beginClaimOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OrderWorkflow.BeginOrderClaimWorkflowInput, OrderChangeDTO, []>;
//# sourceMappingURL=begin-order-claim.d.ts.map