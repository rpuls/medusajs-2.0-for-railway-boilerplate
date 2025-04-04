import { FilterableStockLocationProps, StockLocationDTO, UpdateStockLocationInput } from "@medusajs/framework/types";
/**
 * The data to update the stock locations.
 */
export interface UpdateStockLocationsWorkflowInput {
    /**
     * The filters to select the stock locations to update.
     */
    selector: FilterableStockLocationProps;
    /**
     * The data to update the stock locations with.
     */
    update: UpdateStockLocationInput;
}
export declare const updateStockLocationsWorkflowId = "update-stock-locations-workflow";
/**
 * This workflow updates stock locations matching the specified filters. It's used by the
 * [Update Stock Location Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_poststocklocationsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update stock locations in your custom flows.
 *
 * @example
 * const { result } = await updateStockLocationsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "sloc_123"
 *     },
 *     update: {
 *       name: "European Warehouse"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update stock locations.
 */
export declare const updateStockLocationsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateStockLocationsWorkflowInput, StockLocationDTO[], []>;
//# sourceMappingURL=update-stock-locations.d.ts.map