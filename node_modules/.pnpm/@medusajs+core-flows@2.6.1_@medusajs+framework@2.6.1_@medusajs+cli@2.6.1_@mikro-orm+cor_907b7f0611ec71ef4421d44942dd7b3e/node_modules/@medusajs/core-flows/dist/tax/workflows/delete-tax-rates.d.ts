/**
 * The data to delete tax rates.
 */
export type DeleteTaxRatesWorkflowInput = {
    /**
     * The IDs of the tax rates to delete.
     */
    ids: string[];
};
export declare const deleteTaxRatesWorkflowId = "delete-tax-rates";
/**
 * This workflow deletes one or more tax rates. It's used by the
 * [Delete Tax Rates Admin API Route](https://docs.medusajs.com/api/admin#tax-rates_deletetaxratesid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete tax rates in your custom flows.
 *
 * @example
 * const { result } = await deleteTaxRatesWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["txr_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more tax rates.
 */
export declare const deleteTaxRatesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteTaxRatesWorkflowInput, void, []>;
//# sourceMappingURL=delete-tax-rates.d.ts.map