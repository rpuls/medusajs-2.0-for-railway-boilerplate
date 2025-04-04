import { CreateOrderShippingMethodDTO } from "@medusajs/framework/types";
/**
 * The details of creating order shipping methods.
 */
export interface CreateOrderShippingMethodsStepInput {
    /**
     * The shipping methods to create.
     */
    shipping_methods: CreateOrderShippingMethodDTO[];
}
/**
 * This step creates order shipping methods.
 */
export declare const createOrderShippingMethods: import("@medusajs/framework/workflows-sdk").StepFunction<CreateOrderShippingMethodsStepInput, import("@medusajs/framework/types").OrderShippingMethodDTO[]>;
//# sourceMappingURL=create-order-shipping-methods.d.ts.map