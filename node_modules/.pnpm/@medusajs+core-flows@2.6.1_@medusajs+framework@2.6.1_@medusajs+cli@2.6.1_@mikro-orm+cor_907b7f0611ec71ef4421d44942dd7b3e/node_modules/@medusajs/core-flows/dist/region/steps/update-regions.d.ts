import { FilterableRegionProps, UpdateRegionDTO } from "@medusajs/framework/types";
/**
 * The data to update regions.
 */
export type UpdateRegionsStepInput = {
    /**
     * The filters to select the regions to update.
     */
    selector: FilterableRegionProps;
    /**
     * The data to update in the regions.
     */
    update: UpdateRegionDTO;
};
export declare const updateRegionsStepId = "update-region";
/**
 * This step updates regions matching the specified filters.
 *
 * @example
 * const data = updateRegionsStep({
 *   selector: {
 *     id: "reg_123"
 *   },
 *   update: {
 *     name: "United States"
 *   }
 * })
 */
export declare const updateRegionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateRegionsStepInput, import("@medusajs/framework/types").RegionDTO[]>;
//# sourceMappingURL=update-regions.d.ts.map