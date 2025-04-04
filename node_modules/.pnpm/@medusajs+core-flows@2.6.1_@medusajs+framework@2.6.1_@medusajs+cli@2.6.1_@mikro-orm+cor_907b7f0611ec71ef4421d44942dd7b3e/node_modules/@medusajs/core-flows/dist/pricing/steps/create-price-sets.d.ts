import { CreatePriceSetDTO } from "@medusajs/framework/types";
/**
 * The price sets to create.
 */
export type CreatePriceSetWorkflowInput = CreatePriceSetDTO[];
export declare const createPriceSetsStepId = "create-price-sets";
/**
 * This step creates one or more price sets.
 *
 * @example
 * const data = createPriceSetsStep([{
 *   prices: [
 *     {
 *       amount: 10,
 *       currency_code: "usd",
 *     }
 *   ]
 * }])
 */
export declare const createPriceSetsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreatePriceSetWorkflowInput, import("@medusajs/framework/types").PriceSetDTO[]>;
//# sourceMappingURL=create-price-sets.d.ts.map