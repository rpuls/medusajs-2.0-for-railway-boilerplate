import { PricingWorkflow } from "@medusajs/framework/types";
/**
 * The price preferences to create.
 */
export type CreatePricePreferencesStepInput = PricingWorkflow.CreatePricePreferencesWorkflowInput[];
export declare const createPricePreferencesStepId = "create-price-preferences";
/**
 * This step creates one or more price preferences.
 *
 * @example
 * const data = createPricePreferencesStep([{
 *   attribute: "region_id",
 *   value: "reg_123",
 *   is_tax_inclusive: true
 * }])
 */
export declare const createPricePreferencesStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreatePricePreferencesStepInput, import("@medusajs/framework/types").PricePreferenceDTO[]>;
//# sourceMappingURL=create-price-preferences.d.ts.map