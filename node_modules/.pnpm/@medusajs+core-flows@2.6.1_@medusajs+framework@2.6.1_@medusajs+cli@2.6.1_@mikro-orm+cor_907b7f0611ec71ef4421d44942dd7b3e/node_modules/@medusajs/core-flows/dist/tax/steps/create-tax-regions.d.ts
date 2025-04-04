import { CreateTaxRegionDTO } from "@medusajs/framework/types";
export declare const createTaxRegionsStepId = "create-tax-regions";
/**
 * This step creates one or more tax regions.
 *
 * @example
 * const data = createTaxRegionsStep([
 *   {
 *     country_code: "us",
 *   }
 * ])
 */
export declare const createTaxRegionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateTaxRegionDTO[], import("@medusajs/framework/types").TaxRegionDTO[]>;
//# sourceMappingURL=create-tax-regions.d.ts.map