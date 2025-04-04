/**
 * Configurations to retrieve products.
 */
export type GetProductsStepInput = {
    /**
     * The IDs of the products to retrieve.
     */
    ids?: string[];
};
export declare const getProductsStepId = "get-products";
/**
 * This step retrieves products, with ability to filter by product IDs.
 */
export declare const getProductsStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetProductsStepInput, import("@medusajs/framework/types").ProductDTO[]>;
//# sourceMappingURL=get-products.d.ts.map