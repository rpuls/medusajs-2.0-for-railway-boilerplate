export type DeleteRegionsWorkflowInput = {
    ids: string[];
};
export declare const deleteRegionsWorkflowId = "delete-regions";
/**
 * This workflow deletes one or more regions. It's used by the
 * [Delete Region Admin API Route](https://docs.medusajs.com/api/admin#regions_deleteregionsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete regions in your custom flows.
 *
 * @example
 * const { result } = await deleteRegionsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["reg_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more regions.
 */
export declare const deleteRegionsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteRegionsWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-regions.d.ts.map