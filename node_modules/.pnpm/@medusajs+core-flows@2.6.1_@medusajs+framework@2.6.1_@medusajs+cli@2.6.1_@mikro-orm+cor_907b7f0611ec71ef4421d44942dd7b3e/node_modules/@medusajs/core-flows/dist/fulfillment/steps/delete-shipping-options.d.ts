import { DeleteEntityInput } from "@medusajs/framework/modules-sdk";
/**
 * The IDs of the shipping options to delete.
 */
export type DeleteShippingOptionsStepInput = string[];
export declare const deleteShippingOptionsStepId = "delete-shipping-options-step";
/**
 * This step deletes one or more shipping options.
 */
export declare const deleteShippingOptionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<DeleteShippingOptionsStepInput, DeleteEntityInput>;
//# sourceMappingURL=delete-shipping-options.d.ts.map