import { CreateShippingMethodDTO } from "@medusajs/framework/types";
/**
 * The details of the shipping methods to add.
 */
export interface AddShippingMethodToCartStepInput {
    /**
     * The shipping methods to add.
     */
    shipping_methods: CreateShippingMethodDTO[];
}
export declare const addShippingMethodToCartStepId = "add-shipping-method-to-cart-step";
/**
 * This step adds shipping methods to a cart.
 *
 * @example
 * const data = addShippingMethodToCartStep({
 *   shipping_methods: [
 *     {
 *       name: "Standard Shipping",
 *       cart_id: "cart_123",
 *       amount: 10,
 *     }
 *   ]
 * })
 */
export declare const addShippingMethodToCartStep: import("@medusajs/framework/workflows-sdk").StepFunction<AddShippingMethodToCartStepInput, import("@medusajs/framework/types").CartShippingMethodDTO[]>;
//# sourceMappingURL=add-shipping-method-to-cart.d.ts.map