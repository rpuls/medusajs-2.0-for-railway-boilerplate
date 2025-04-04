import { FilterableStockLocationProps, UpdateStockLocationInput } from "@medusajs/framework/types";
/**
 * The data to update stock locations.
 */
interface StepInput {
    /**
     * The filters to select stock locations to update.
     */
    selector: FilterableStockLocationProps;
    /**
     * The data to update stock locations with.
     */
    update: UpdateStockLocationInput;
}
export declare const updateStockLocationsStepId = "update-stock-locations-step";
/**
 * This step updates stock locations matching the specified filters.
 *
 * @example
 * const data = updateStockLocationsStep({
 *   selector: {
 *     id: "sloc_123"
 *   },
 *   update: {
 *     name: "European Warehouse"
 *   }
 * })
 */
export declare const updateStockLocationsStep: import("@medusajs/framework/workflows-sdk").StepFunction<StepInput, import("@medusajs/framework/types").StockLocationDTO[]>;
export {};
//# sourceMappingURL=update-stock-locations.d.ts.map