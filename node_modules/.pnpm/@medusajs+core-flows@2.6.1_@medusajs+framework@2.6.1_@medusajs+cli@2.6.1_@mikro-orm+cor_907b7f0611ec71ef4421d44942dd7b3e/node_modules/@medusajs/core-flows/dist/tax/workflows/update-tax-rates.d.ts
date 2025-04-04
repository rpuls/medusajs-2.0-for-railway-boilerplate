import { FilterableTaxRateProps, TaxRateDTO, UpdateTaxRateDTO } from "@medusajs/framework/types";
/**
 * The data to update tax rates.
 */
export type UpdateTaxRatesWorkflowInput = {
    /**
     * The filters to select the tax rates to update.
     */
    selector: FilterableTaxRateProps;
    /**
     * The data to update in the tax rates.
     */
    update: UpdateTaxRateDTO;
};
/**
 * The updated tax rates.
 */
export type UpdateTaxRatesWorkflowOutput = TaxRateDTO[];
/**
 * The data to retrieve the IDs of tax rate rules.
 */
export type MaybeListTaxRateRuleIdsStepInput = {
    /**
     * The IDs of the tax rates to retrieve their rules.
     */
    tax_rate_ids: string[];
    /**
     * The data to update in the tax rates.
     */
    update: UpdateTaxRateDTO;
};
/**
 * This step lists the rules to update in a tax rate update object.
 *
 * @example
 * const data = maybeListTaxRateRuleIdsStep({
 *   tax_rate_ids: ["txr_123"],
 *   update: {
 *     code: "VAT",
 *   }
 * })
 */
export declare const maybeListTaxRateRuleIdsStep: import("@medusajs/framework/workflows-sdk").StepFunction<MaybeListTaxRateRuleIdsStepInput, string[]>;
export declare const updateTaxRatesWorkflowId = "update-tax-rates";
/**
 * This workflow updates tax rates matching specified filters. It's used by the
 * [Update Tax Rates Admin API Route](https://docs.medusajs.com/api/admin#tax-rates_posttaxratesid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update tax rates in your custom flows.
 *
 * @example
 * const { result } = await updateTaxRatesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: ["txr_123"]
 *     },
 *     update: {
 *       code: "VAT"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update tax rates.
 */
export declare const updateTaxRatesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateTaxRatesWorkflowInput, UpdateTaxRatesWorkflowOutput, []>;
//# sourceMappingURL=update-tax-rates.d.ts.map