import { CreateTaxRateRuleDTO, TaxRateRuleDTO } from "@medusajs/framework/types";
/**
 * The data to create tax rules for rates.
 */
export type CreateTaxRateRulesWorkflowInput = {
    /**
     * The rules to create.
     */
    rules: CreateTaxRateRuleDTO[];
};
/**
 * The created tax rules for rates.
 */
export type CreateTaxRateRulesWorkflowOutput = TaxRateRuleDTO[];
export declare const createTaxRateRulesWorkflowId = "create-tax-rate-rules";
/**
 * This workflow creates one or more tax rules for rates. It's used by the
 * [Create Tax Rules for Rates Admin API Route](https://docs.medusajs.com/api/admin#tax-rates_posttaxratesidrules).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create tax rules for rates in your custom flows.
 *
 * @example
 * const { result } = await createTaxRateRulesWorkflow(container)
 * .run({
 *   input: {
 *     rules: [
 *       {
 *         tax_rate_id: "txr_123",
 *         reference: "product_type",
 *         reference_id: "ptyp_123"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more tax rules for rates.
 */
export declare const createTaxRateRulesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateTaxRateRulesWorkflowInput, CreateTaxRateRulesWorkflowOutput, []>;
//# sourceMappingURL=create-tax-rate-rules.d.ts.map