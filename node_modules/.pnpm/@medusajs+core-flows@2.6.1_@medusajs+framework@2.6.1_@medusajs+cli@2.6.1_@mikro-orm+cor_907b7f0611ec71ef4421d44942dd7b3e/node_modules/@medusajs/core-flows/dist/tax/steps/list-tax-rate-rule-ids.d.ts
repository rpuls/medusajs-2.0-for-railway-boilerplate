import { FilterableTaxRateRuleProps } from "@medusajs/framework/types";
/**
 * The data to retrieve the tax rate rule IDs.
 */
export type ListTaxRateRuleIdsStepInput = {
    /**
     * The filters to select the tax rate rules.
     */
    selector: FilterableTaxRateRuleProps;
};
export declare const listTaxRateRuleIdsStepId = "list-tax-rate-rule-ids";
/**
 * This step retrieves the IDs of tax rate rules matching the specified filters.
 *
 * @example
 * const data = listTaxRateRuleIdsStep({
 *   selector: {
 *     tax_rate_id: "txr_123"
 *   }
 * })
 */
export declare const listTaxRateRuleIdsStep: import("@medusajs/framework/workflows-sdk").StepFunction<ListTaxRateRuleIdsStepInput, string[]>;
//# sourceMappingURL=list-tax-rate-rule-ids.d.ts.map