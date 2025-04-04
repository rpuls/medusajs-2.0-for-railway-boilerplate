import { FulfillmentWorkflow } from "@medusajs/framework/types";
export declare const updateFulfillmentStepId = "update-fulfillment";
/**
 * This step updates a fulfillment.
 *
 * @example
 * const data = updateFulfillmentStep({
 *   id: "ful_123",
 *   delivered_at: new Date(),
 * })
 */
export declare const updateFulfillmentStep: import("@medusajs/framework/workflows-sdk").StepFunction<FulfillmentWorkflow.UpdateFulfillmentWorkflowInput, import("@medusajs/framework/types").FulfillmentDTO>;
//# sourceMappingURL=update-fulfillment.d.ts.map