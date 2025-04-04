import { ProductTypes } from "@medusajs/framework/types";
/**
 * The details of the product variants update.
 */
export type UpdateProductVariantsStepInput = {
    /**
     * The filters to select the product variants to update.
     */
    selector: ProductTypes.FilterableProductVariantProps;
    /**
     * The data to update the product variants with.
     */
    update: ProductTypes.UpdateProductVariantDTO;
} | {
    /**
     * The data to create or update product variants.
     */
    product_variants: ProductTypes.UpsertProductVariantDTO[];
};
export declare const updateProductVariantsStepId = "update-product-variants";
/**
 * This step updates one or more product variants.
 *
 * @example
 * To update product variants by their ID:
 *
 * ```ts
 * const data = updateProductVariantsStep({
 *   product_variants: [
 *     {
 *       id: "variant_123",
 *       title: "Small Shirt"
 *     }
 *   ]
 * })
 * ```
 *
 * To update product variants matching a filter:
 *
 * ```ts
 * const data = updateProductVariantsStep({
 *   selector: {
 *     product_id: "prod_123",
 *   },
 *   update: {
 *     material: "cotton",
 *   }
 * })
 * ```
 */
export declare const updateProductVariantsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateProductVariantsStepInput, ProductTypes.ProductVariantDTO[]>;
//# sourceMappingURL=update-product-variants.d.ts.map