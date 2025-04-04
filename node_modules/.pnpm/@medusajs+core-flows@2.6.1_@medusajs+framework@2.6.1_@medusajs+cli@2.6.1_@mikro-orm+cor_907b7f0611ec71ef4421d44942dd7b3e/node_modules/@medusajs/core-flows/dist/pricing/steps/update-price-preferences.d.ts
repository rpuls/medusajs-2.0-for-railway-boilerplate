import { PricingWorkflow } from "@medusajs/framework/types";
export declare const updatePricePreferencesStepId = "update-price-preferences";
/**
 * This step updates price preferences matching the specified filters.
 *
 * @example
 * const data = updatePricePreferencesStep({
 *   selector: {
 *     id: ["pp_123"]
 *   },
 *   update: {
 *     is_tax_inclusive: true
 *   }
 * })
 */
export declare const updatePricePreferencesStep: import("@medusajs/framework/workflows-sdk").StepFunction<PricingWorkflow.UpdatePricePreferencesWorkflowInput, import("@medusajs/framework/types").PricePreferenceDTO[]>;
//# sourceMappingURL=update-price-preferences.d.ts.map