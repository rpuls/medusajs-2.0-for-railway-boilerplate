import { CreateTaxRateRuleDTO } from "@medusajs/framework/types";
export declare const createTaxRateRulesStepId = "create-tax-rate-rules";
/**
 * This step creates one or more tax rate rules.
 *
 * @example
 * const data = createTaxRateRulesStep([
 *   {
 *     reference: "product_type",
 *     reference_id: "ptyp_123",
 *     tax_rate_id: "txr_123"
 *   }
 * ])
 */
export declare const createTaxRateRulesStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateTaxRateRuleDTO[], import("@medusajs/framework/types").TaxRateRuleDTO[]>;
//# sourceMappingURL=create-tax-rate-rules.d.ts.map