import { WorkflowTypes } from "@medusajs/framework/types";
export declare const updateRegionsWorkflowId = "update-regions";
/**
 * This workflow updates regions matching the specified filters. It's used by the
 * [Update Region Admin API Route](https://docs.medusajs.com/api/admin#regions_postregionsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update regions in your custom flows.
 *
 * @example
 * const { result } = await updateRegionsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "reg_123"
 *     },
 *     update: {
 *       name: "United States"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update regions.
 */
export declare const updateRegionsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<WorkflowTypes.RegionWorkflow.UpdateRegionsWorkflowInput, WorkflowTypes.RegionWorkflow.UpdateRegionsWorkflowOutput, []>;
//# sourceMappingURL=update-regions.d.ts.map