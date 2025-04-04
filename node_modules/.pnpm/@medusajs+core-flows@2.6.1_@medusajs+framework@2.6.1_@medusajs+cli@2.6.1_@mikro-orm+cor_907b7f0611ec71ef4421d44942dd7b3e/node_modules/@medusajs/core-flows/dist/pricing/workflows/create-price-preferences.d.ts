import { PricingWorkflow } from "@medusajs/framework/types";
/**
 * The price preferences to create.
 */
export type CreatePricePreferencesWorkflowInput = PricingWorkflow.CreatePricePreferencesWorkflowInput[];
export declare const createPricePreferencesWorkflowId = "create-price-preferences";
/**
 * This workflow creates one or more price preferences. It's used by the
 * [Create Price Preferences Admin API Route](https://docs.medusajs.com/api/admin#price-preferences_postpricepreferences).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create price preferences in your custom flows.
 *
 * @example
 * const { result } = await createPricePreferencesWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       attribute: "region_id",
 *       value: "reg_123",
 *       is_tax_inclusive: true
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Create one or more price preferences.
 */
export declare const createPricePreferencesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreatePricePreferencesWorkflowInput, import("@medusajs/framework/types").PricePreferenceDTO[], []>;
//# sourceMappingURL=create-price-preferences.d.ts.map