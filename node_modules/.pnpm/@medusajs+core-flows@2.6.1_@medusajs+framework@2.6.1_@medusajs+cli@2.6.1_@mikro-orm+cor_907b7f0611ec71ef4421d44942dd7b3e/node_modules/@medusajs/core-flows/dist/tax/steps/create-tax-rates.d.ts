import { CreateTaxRateDTO } from "@medusajs/framework/types";
export declare const createTaxRatesStepId = "create-tax-rates";
/**
 * This step creates one or more tax rates.
 *
 * @example
 * const data = createTaxRatesStep([
 *   {
 *     name: "Default",
 *     tax_region_id: "txreg_123",
 *   }
 * ])
 */
export declare const createTaxRatesStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateTaxRateDTO[], import("@medusajs/framework/types").TaxRateDTO[]>;
//# sourceMappingURL=create-tax-rates.d.ts.map