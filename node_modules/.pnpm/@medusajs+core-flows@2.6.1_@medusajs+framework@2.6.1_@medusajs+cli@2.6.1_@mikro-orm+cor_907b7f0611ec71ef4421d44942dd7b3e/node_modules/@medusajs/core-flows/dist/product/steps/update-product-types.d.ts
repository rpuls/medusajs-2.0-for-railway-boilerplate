import { ProductTypes } from "@medusajs/framework/types";
/**
 * The data to identify and update the product tags.
 */
export type UpdateProductTypesStepInput = {
    /**
     * The filters to select the product types to update.
     */
    selector: ProductTypes.FilterableProductTypeProps;
    /**
     * The data to update the product types with.
     */
    update: ProductTypes.UpdateProductTypeDTO;
};
export declare const updateProductTypesStepId = "update-product-types";
/**
 * This step updates product types matching the specified filters.
 *
 * @example
 * const data = updateProductTypesStep({
 *   selector: {
 *     id: "popt_123"
 *   },
 *   update: {
 *     value: "clothing"
 *   }
 * })
 */
export declare const updateProductTypesStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateProductTypesStepInput, ProductTypes.ProductTypeDTO[]>;
//# sourceMappingURL=update-product-types.d.ts.map