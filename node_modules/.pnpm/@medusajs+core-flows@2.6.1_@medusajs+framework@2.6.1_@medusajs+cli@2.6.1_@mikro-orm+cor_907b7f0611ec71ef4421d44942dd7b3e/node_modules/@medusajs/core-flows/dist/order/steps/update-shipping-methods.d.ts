import { UpdateOrderShippingMethodDTO } from "@medusajs/framework/types";
/**
 * The order shipping methods to update.
 */
export type UpdateOrderShippingMethodsStepInput = UpdateOrderShippingMethodDTO[];
export declare const updateOrderShippingMethodsStepId = "update-order-shopping-methods";
/**
 * This step updates order shipping methods.
 */
export declare const updateOrderShippingMethodsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateOrderShippingMethodsStepInput, import("@medusajs/framework/types").OrderShippingMethodDTO[]>;
//# sourceMappingURL=update-shipping-methods.d.ts.map