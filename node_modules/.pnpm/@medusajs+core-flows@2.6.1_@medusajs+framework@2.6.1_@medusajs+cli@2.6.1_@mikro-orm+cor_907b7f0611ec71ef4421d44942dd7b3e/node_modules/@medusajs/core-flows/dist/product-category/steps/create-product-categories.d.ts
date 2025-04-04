import { CreateProductCategoryDTO } from "@medusajs/framework/types";
/**
 * The data to create product categories.
 */
export type CreateProductCategoriesStepInput = {
    /**
     * The product categories to create.
     */
    product_categories: CreateProductCategoryDTO[];
};
export declare const createProductCategoriesStepId = "create-product-categories";
/**
 * This step creates one or more product categories.
 *
 * @example
 * const data = createProductCategoriesStep({
 *   product_categories: [
 *     {
 *       name: "Shoes",
 *     }
 *   ]
 * })
 */
export declare const createProductCategoriesStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateProductCategoriesStepInput, import("@medusajs/framework/types").ProductCategoryDTO[]>;
//# sourceMappingURL=create-product-categories.d.ts.map