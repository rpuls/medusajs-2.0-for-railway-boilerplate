/**
 * The data to delete tax regions.
 */
export type DeleteTaxRegionsWorkflowInput = {
    /**
     * The IDs of the tax regions to delete.
     */
    ids: string[];
};
export declare const deleteTaxRegionsWorkflowId = "delete-tax-regions";
/**
 * This workflow deletes one or more tax regions. It's used by the
 * [Delete Tax Region Admin API Route](https://docs.medusajs.com/api/admin#tax-regions_deletetaxregionsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete tax regions in your custom flows.
 *
 * @example
 * const { result } = await deleteTaxRegionsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["txreg_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more tax regions.
 */
export declare const deleteTaxRegionsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteTaxRegionsWorkflowInput, void, []>;
//# sourceMappingURL=delete-tax-regions.d.ts.map