import { FilterableProductCategoryProps, UpdateProductCategoryDTO } from "@medusajs/framework/types";
/**
 * The data to update the product categories.
 */
export type UpdateProductCategoriesStepInput = {
    /**
     * The filters to select the product categories to update.
     */
    selector: FilterableProductCategoryProps;
    /**
     * The data to update in the product categories.
     */
    update: UpdateProductCategoryDTO;
};
export declare const updateProductCategoriesStepId = "update-product-categories";
/**
 * This step updates product categories matching specified filters.
 *
 * @example
 * const data = updateProductCategoriesStep({
 *   selector: {
 *     id: "pcat_123",
 *   },
 *   update: {
 *     name: "Shoes",
 *   }
 * })
 */
export declare const updateProductCategoriesStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateProductCategoriesStepInput, import("@medusajs/framework/types").ProductCategoryDTO[]>;
//# sourceMappingURL=update-product-categories.d.ts.map