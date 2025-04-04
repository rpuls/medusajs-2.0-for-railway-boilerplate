/**
 * The details of deleting order shipping methods.
 */
export interface DeleteOrderShippingMethodsStepInput {
    /**
     * The IDs of the order shipping methods to delete.
     */
    ids: string[];
}
/**
 * This step deletes order shipping methods.
 */
export declare const deleteOrderShippingMethods: import("@medusajs/framework/workflows-sdk").StepFunction<DeleteOrderShippingMethodsStepInput, void | Record<string, string[]>>;
//# sourceMappingURL=delete-order-shipping-methods.d.ts.map