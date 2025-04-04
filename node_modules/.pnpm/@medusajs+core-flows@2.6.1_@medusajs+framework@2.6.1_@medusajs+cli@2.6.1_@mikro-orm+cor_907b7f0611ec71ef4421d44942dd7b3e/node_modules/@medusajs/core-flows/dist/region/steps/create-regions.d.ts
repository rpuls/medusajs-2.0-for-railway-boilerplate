import { CreateRegionDTO } from "@medusajs/framework/types";
export declare const createRegionsStepId = "create-regions";
/**
 * This step creates one or more regions.
 *
 * @example
 * const data = createRegionsStep([
 *   {
 *     currency_code: "usd",
 *     name: "United States",
 *     countries: ["us"],
 *   }
 * ])
 */
export declare const createRegionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateRegionDTO[], import("@medusajs/framework/types").RegionDTO[]>;
//# sourceMappingURL=create-regions.d.ts.map