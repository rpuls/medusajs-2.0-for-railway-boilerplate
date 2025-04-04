import { FulfillmentDTO } from "@medusajs/framework/types";
export declare const validateFulfillmentDeliverabilityStepId = "validate-fulfillment-deliverability";
/**
 * This step validates that a fulfillment can be marked delivered.
 * If the fulfillment has already been canceled or delivered, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve a fulfillment's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validateFulfillmentDeliverabilityStep({
 *   id: "ful_123",
 *   // other fulfillment data...
 * })
 */
export declare const validateFulfillmentDeliverabilityStep: import("@medusajs/framework/workflows-sdk").StepFunction<FulfillmentDTO, undefined>;
/**
 * The data to mark a fulfillment as delivered.
 */
export type MarkFulfillmentAsDeliveredInput = {
    /**
     * The fulfillment's ID.
     */
    id: string;
};
export declare const markFulfillmentAsDeliveredWorkflowId = "mark-fulfillment-as-delivered-workflow";
/**
 * This workflow marks a fulfillment as delivered. It's used by the {@link markOrderFulfillmentAsDeliveredWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to mark a fulfillment as delivered in your custom flows.
 *
 * @example
 * const { result } = await markFulfillmentAsDeliveredWorkflow(container)
 * .run({
 *   input: {
 *     id: "ful_123",
 *   }
 * })
 *
 * @summary
 *
 * Mark a fulfillment as delivered.
 */
export declare const markFulfillmentAsDeliveredWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<MarkFulfillmentAsDeliveredInput, FulfillmentDTO, []>;
//# sourceMappingURL=mark-fulfillment-as-delivered.d.ts.map