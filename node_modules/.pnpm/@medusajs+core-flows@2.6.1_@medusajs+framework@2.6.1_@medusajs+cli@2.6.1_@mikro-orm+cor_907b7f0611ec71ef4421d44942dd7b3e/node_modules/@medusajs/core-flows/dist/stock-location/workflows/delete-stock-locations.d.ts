/**
 * The data to delete stock locations.
 */
export interface DeleteStockLocationWorkflowInput {
    /**
     * The IDs of the stock locations to delete.
     */
    ids: string[];
}
export declare const deleteStockLocationsWorkflowId = "delete-stock-locations-workflow";
/**
 * This workflow deletes one or more stock locations. It's used by the
 * [Delete Stock Location Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_deletestocklocationsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete stock locations in your custom flows.
 *
 * @example
 * const { result } = await deleteStockLocationsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["sloc_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more stock locations.
 */
export declare const deleteStockLocationsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteStockLocationWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-stock-locations.d.ts.map