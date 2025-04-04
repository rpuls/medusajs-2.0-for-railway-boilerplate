import { ProductTypes } from "@medusajs/framework/types";
/**
 * The data to identify and update the product options.
 */
export type UpdateProductOptionsStepInput = {
    /**
     * The filters to select the product options to update.
     */
    selector: ProductTypes.FilterableProductOptionProps;
    /**
     * The data to update the product options with.
     */
    update: ProductTypes.UpdateProductOptionDTO;
};
export declare const updateProductOptionsStepId = "update-product-options";
/**
 * This step updates product options matching the specified filters.
 *
 * @example
 * const data = updateProductOptionsStep({
 *   selector: {
 *     id: "popt_123"
 *   },
 *   update: {
 *     title: "Size"
 *   }
 * })
 */
export declare const updateProductOptionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateProductOptionsStepInput, ProductTypes.ProductOptionDTO[]>;
//# sourceMappingURL=update-product-options.d.ts.map