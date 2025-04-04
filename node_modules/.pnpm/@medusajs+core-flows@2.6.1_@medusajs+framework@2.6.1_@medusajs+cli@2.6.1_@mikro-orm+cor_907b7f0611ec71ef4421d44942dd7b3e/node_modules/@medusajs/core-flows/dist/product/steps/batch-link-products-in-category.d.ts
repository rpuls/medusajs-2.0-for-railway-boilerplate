import { ProductCategoryWorkflow } from "@medusajs/framework/types";
export declare const batchLinkProductsToCategoryStepId = "batch-link-products-to-category";
/**
 * This step manages the links between a category and products.
 *
 * @example
 * const data = batchLinkProductsToCategoryStep({
 *   id: "pcat_123",
 *   add: ["product_123"],
 *   remove: ["product_321"]
 * })
 */
export declare const batchLinkProductsToCategoryStep: import("@medusajs/framework/workflows-sdk").StepFunction<ProductCategoryWorkflow.BatchUpdateProductsOnCategoryWorkflowInput, undefined>;
//# sourceMappingURL=batch-link-products-in-category.d.ts.map