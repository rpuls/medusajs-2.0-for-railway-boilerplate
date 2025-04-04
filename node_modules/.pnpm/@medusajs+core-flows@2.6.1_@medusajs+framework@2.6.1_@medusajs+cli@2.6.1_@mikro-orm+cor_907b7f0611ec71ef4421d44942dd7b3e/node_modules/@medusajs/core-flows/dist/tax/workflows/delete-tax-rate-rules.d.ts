/**
 * The data to delete tax rate rules.
 */
export type DeleteTaxRateRulesWorkflowInput = {
    /**
     * The IDs of the tax rate rules to delete.
     */
    ids: string[];
};
export declare const deleteTaxRateRulesWorkflowId = "delete-tax-rate-rules";
/**
 * This workflow deletes one or more tax rate rules. It's used by the
 * [Remove Rule of Tax Rate Admin API Route](https://docs.medusajs.com/api/admin#tax-rates_deletetaxratesidrulesrule_id).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete tax rate rules in your custom flows.
 *
 * @example
 * const { result } = await deleteTaxRateRulesWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["txrr_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more tax rate rules.
 */
export declare const deleteTaxRateRulesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteTaxRateRulesWorkflowInput, void, []>;
//# sourceMappingURL=delete-tax-rate-rules.d.ts.map