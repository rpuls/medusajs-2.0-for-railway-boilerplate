import { UpdateTaxRegionDTO } from "@medusajs/framework/types";
/**
 * The tax regions to update.
 */
export type UpdateTaxRegionsStepInput = UpdateTaxRegionDTO[];
export declare const updateTaxRegionsStepId = "update-tax-regions";
/**
 * This step updates tax regions.
 *
 * @example
 * const data = updateTaxRegionsStep([
 *   {
 *     id: "txreg_123",
 *     province_code: "CA",
 *   }
 * ])
 */
export declare const updateTaxRegionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateTaxRegionDTO[], import("@medusajs/framework/types").TaxRegionDTO[]>;
//# sourceMappingURL=update-tax-regions.d.ts.map