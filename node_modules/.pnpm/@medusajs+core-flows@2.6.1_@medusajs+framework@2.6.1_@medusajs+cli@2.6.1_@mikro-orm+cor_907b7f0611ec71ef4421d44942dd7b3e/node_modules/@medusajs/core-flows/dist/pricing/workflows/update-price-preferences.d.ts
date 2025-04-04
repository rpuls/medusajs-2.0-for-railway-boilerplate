import { PricingWorkflow } from "@medusajs/framework/types";
export declare const updatePricePreferencesWorkflowId = "update-price-preferences";
/**
 * This workflow updates one or more price preferences. It's used by the
 * [Update Price Preference Admin API Route](https://docs.medusajs.com/api/admin#price-preferences_postpricepreferencesid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update price preferences in your custom flows.
 *
 * @example
 * const { result } = await updatePricePreferencesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: ["pp_123"]
 *     },
 *     update: {
 *       is_tax_inclusive: true
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more price preferences.
 */
export declare const updatePricePreferencesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<PricingWorkflow.UpdatePricePreferencesWorkflowInput, import("@medusajs/framework/types").PricePreferenceDTO[], []>;
//# sourceMappingURL=update-price-preferences.d.ts.map