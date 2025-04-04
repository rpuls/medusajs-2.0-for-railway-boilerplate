import { CreateTaxRateRuleDTO, TaxRateRuleDTO } from "@medusajs/framework/types";
/**
 * The data to set the rules for tax rates.
 */
export type SetTaxRatesRulesWorkflowInput = {
    /**
     * The IDs of the tax rates to set their rules.
     */
    tax_rate_ids: string[];
    /**
     * The rules to create for the tax rates.
     */
    rules: Omit<CreateTaxRateRuleDTO, "tax_rate_id">[];
};
export declare const setTaxRateRulesWorkflowId = "set-tax-rate-rules";
/**
 * This workflow sets the rules of tax rates.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to set the rules of tax rates in your custom flows.
 *
 * @example
 * const { result } = await setTaxRateRulesWorkflow(container)
 * .run({
 *   input: {
 *     tax_rate_ids: ["txr_123"],
 *     rules: [
 *       {
 *         reference: "product_type",
 *         reference_id: "ptyp_123"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Set the rules of tax rates.
 */
export declare const setTaxRateRulesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<SetTaxRatesRulesWorkflowInput, TaxRateRuleDTO[], []>;
//# sourceMappingURL=set-tax-rate-rules.d.ts.map