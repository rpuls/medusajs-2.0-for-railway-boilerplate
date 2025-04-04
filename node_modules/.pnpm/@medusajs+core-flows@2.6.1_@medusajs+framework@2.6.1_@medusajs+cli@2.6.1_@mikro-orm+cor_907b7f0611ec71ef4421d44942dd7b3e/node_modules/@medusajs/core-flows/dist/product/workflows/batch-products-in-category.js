"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchLinkProductsToCategoryWorkflow = exports.batchLinkProductsToCategoryWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const batch_link_products_in_category_1 = require("../steps/batch-link-products-in-category");
exports.batchLinkProductsToCategoryWorkflowId = "batch-link-products-to-category";
/**
 * This workflow manages the links between a category and products. It's used by the
 * [Manage Products of Category Admin API Route](https://docs.medusajs.com/api/admin#product-categories_postproductcategoriesidproducts).
 *
 * You can use this workflow within your own customizations or custom workflows to manage the products in a category.
 *
 * @example
 * const { result } = await batchLinkProductsToCategoryWorkflow(container)
 * .run({
 *   input: {
 *     id: "pcat_123",
 *     add: ["prod_123"],
 *     remove: ["prod_321"]
 *   }
 * })
 *
 * @summary
 *
 * Manage the links between a collection and products.
 */
exports.batchLinkProductsToCategoryWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.batchLinkProductsToCategoryWorkflowId, (
// eslint-disable-next-line max-len
input) => {
    return (0, batch_link_products_in_category_1.batchLinkProductsToCategoryStep)(input);
});
//# sourceMappingURL=batch-products-in-category.js.map