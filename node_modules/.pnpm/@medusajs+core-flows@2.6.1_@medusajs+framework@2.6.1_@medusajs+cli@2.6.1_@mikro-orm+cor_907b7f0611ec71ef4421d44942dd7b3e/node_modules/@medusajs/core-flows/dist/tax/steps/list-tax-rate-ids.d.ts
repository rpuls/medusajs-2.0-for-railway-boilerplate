import { FilterableTaxRateProps } from "@medusajs/framework/types";
/**
 * The data to retrieve the tax rate IDs.
 */
export type ListTaxRateIdsStepInput = {
    /**
     * The filters to select the tax rates.
     */
    selector: FilterableTaxRateProps;
};
export declare const listTaxRateIdsStepId = "list-tax-rate-ids";
/**
 * This step retrieves the IDs of tax rates matching the specified filters.
 *
 * @example
 * const data = listTaxRateIdsStep({
 *   selector: {
 *     tax_region_id: "txreg_123"
 *   }
 * })
 */
export declare const listTaxRateIdsStep: import("@medusajs/framework/workflows-sdk").StepFunction<ListTaxRateIdsStepInput, string[]>;
//# sourceMappingURL=list-tax-rate-ids.d.ts.map