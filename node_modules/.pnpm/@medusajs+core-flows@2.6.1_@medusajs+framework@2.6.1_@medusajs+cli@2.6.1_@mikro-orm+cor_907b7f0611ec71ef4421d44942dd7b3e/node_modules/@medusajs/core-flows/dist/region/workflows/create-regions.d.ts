import { WorkflowTypes } from "@medusajs/framework/types";
export declare const createRegionsWorkflowId = "create-regions";
/**
 * This workflow creates one or more regions. It's used by the
 * [Create Region Admin API Route](https://docs.medusajs.com/api/admin#regions_postregions).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create regions in your custom flows.
 *
 * @example
 * const { result } = await createRegionsWorkflow(container)
 * .run({
 *   input: {
 *     regions: [
 *       {
 *         currency_code: "usd",
 *         name: "United States",
 *         countries: ["us"],
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more regions.
 */
export declare const createRegionsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<WorkflowTypes.RegionWorkflow.CreateRegionsWorkflowInput, WorkflowTypes.RegionWorkflow.CreateRegionsWorkflowOutput, []>;
//# sourceMappingURL=create-regions.d.ts.map