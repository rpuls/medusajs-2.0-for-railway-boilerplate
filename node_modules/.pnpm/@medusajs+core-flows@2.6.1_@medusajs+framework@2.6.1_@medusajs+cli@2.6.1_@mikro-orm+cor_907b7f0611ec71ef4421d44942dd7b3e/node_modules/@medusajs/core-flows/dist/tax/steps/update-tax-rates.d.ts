import { FilterableTaxRateProps, UpdateTaxRateDTO } from "@medusajs/framework/types";
/**
 * The data to update tax rates.
 */
export type UpdateTaxRatesStepInput = {
    /**
     * The filters to select the tax rates to update.
     */
    selector: FilterableTaxRateProps;
    /**
     * The data to update in the tax rates.
     */
    update: UpdateTaxRateDTO;
};
export declare const updateTaxRatesStepId = "update-tax-rates";
/**
 * This step updates tax rates matching the specified filters.
 *
 * @example
 * const data = updateTaxRatesStep({
 *   selector: {
 *     id: "txr_123"
 *   },
 *   update: {
 *     name: "Default Tax Rate",
 *   }
 * })
 */
export declare const updateTaxRatesStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateTaxRatesStepInput, import("@medusajs/framework/types").TaxRateDTO[]>;
//# sourceMappingURL=update-tax-rates.d.ts.map