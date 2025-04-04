import { UpdateShippingMethodDTO } from "@medusajs/framework/types";
/**
 * The details of the shipping methods to update.
 */
export type UpdateShippingMethodsStepInput = UpdateShippingMethodDTO[];
export declare const updateShippingMethodsStepId = "update-shipping-methods-step";
/**
 * This step updates a cart's shipping methods.
 *
 * @example
 * const data = updateOrderShippingMethodsStep([
 *   {
 *     id: "sm_123",
 *     amount: 10
 *   }
 * ])
 */
export declare const updateShippingMethodsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateShippingMethodsStepInput, import("@medusajs/framework/types").CartShippingMethodDTO[]>;
//# sourceMappingURL=update-shipping-methods.d.ts.map