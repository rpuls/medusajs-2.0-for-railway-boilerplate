/**
 * The details of the shipping methods to remove.
 */
export interface RemoveShippingMethodFromCartStepInput {
    /**
     * The IDs of the shipping methods to remove.
     */
    shipping_method_ids: string[];
}
/**
 * The shipping methods removed from the cart, along with IDs of related records
 * that were removed.
 */
export type RemoveShippingMethodFromCartStepOutput = Record<string, string[]> | void;
export declare const removeShippingMethodFromCartStepId = "remove-shipping-method-to-cart-step";
/**
 * This step removes shipping methods from a cart.
 */
export declare const removeShippingMethodFromCartStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveShippingMethodFromCartStepInput, void | Record<string, string[]> | null>;
//# sourceMappingURL=remove-shipping-method-from-cart.d.ts.map