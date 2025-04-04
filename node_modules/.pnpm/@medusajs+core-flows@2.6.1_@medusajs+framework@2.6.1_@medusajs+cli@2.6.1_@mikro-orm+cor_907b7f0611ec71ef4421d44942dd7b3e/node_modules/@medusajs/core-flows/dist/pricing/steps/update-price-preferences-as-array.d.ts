import { PricingWorkflow } from "@medusajs/framework/types";
/**
 * The price preferences to update.
 */
export type UpdatePricePreferencesAsArrayStepInput = PricingWorkflow.UpdatePricePreferencesWorkflowInput["update"][];
export declare const updatePricePreferencesAsArrayStepId = "update-price-preferences-as-array";
/**
 * This step creates or updates price preferences.
 *
 * @example
 * const data = updatePricePreferencesAsArrayStep([
 *   {
 *     attribute: "region_id",
 *     value: "reg_123",
 *     is_tax_inclusive: true
 *   }
 * ])
 */
export declare const updatePricePreferencesAsArrayStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdatePricePreferencesAsArrayStepInput, import("@medusajs/framework/types").PricePreferenceDTO[]>;
//# sourceMappingURL=update-price-preferences-as-array.d.ts.map