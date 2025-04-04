import { ProductTypes } from "@medusajs/framework/types";
/**
 * The details of the products update.
 */
export type UpdateProductsStepInput = {
    /**
     * The filters to select the products to update.
     */
    selector: ProductTypes.FilterableProductProps;
    /**
     * The data to update the products with.
     */
    update: ProductTypes.UpdateProductDTO;
} | {
    /**
     * The data to create or update products.
     */
    products: ProductTypes.UpsertProductDTO[];
};
export declare const updateProductsStepId = "update-products";
/**
 * This step updates one or more products.
 *
 * @example
 * To update products by their ID:
 *
 * ```ts
 * const data = updateProductsStep({
 *   products: [
 *     {
 *       id: "prod_123",
 *       title: "Shirt"
 *     }
 *   ]
 * })
 * ```
 *
 * To update products matching a filter:
 *
 * ```ts
 * const data = updateProductsStep({
 *   selector: {
 *     collection_id: "collection_123",
 *   },
 *   update: {
 *     material: "cotton",
 *   }
 * })
 * ```
 */
export declare const updateProductsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateProductsStepInput, ProductTypes.ProductDTO[]>;
//# sourceMappingURL=update-products.d.ts.map