import { ProductTypes } from "@medusajs/framework/types";
/**
 * The data to identify and update the product tags.
 */
export type UpdateProductTagsStepInput = {
    /**
     * The filters to select the product tags to update.
     */
    selector: ProductTypes.FilterableProductTagProps;
    /**
     * The data to update the product tags with.
     */
    update: ProductTypes.UpdateProductTagDTO;
};
export declare const updateProductTagsStepId = "update-product-tags";
/**
 * This step updates product tags matching the specified filters.
 *
 * @example
 * const data = updateProductTagsStep({
 *   selector: {
 *     id: "popt_123"
 *   },
 *   update: {
 *     value: "clothing"
 *   }
 * })
 */
export declare const updateProductTagsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateProductTagsStepInput, ProductTypes.ProductTagDTO[]>;
//# sourceMappingURL=update-product-tags.d.ts.map