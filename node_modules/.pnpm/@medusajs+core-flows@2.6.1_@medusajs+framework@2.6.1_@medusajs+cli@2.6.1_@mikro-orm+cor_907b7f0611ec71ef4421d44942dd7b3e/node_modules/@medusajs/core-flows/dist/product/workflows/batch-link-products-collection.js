"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchLinkProductsToCollectionWorkflow = exports.batchLinkProductsToCollectionWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const batch_link_products_collection_1 = require("../steps/batch-link-products-collection");
exports.batchLinkProductsToCollectionWorkflowId = "batch-link-products-to-collection";
/**
 * This workflow manages the links between a collection and products. It's used by the
 * [Manage Products of Collection Admin API Route](https://docs.medusajs.com/api/admin#collections_postcollectionsidproducts).
 *
 * You can use this workflow within your own customizations or custom workflows to manage the products in a collection.
 *
 * @example
 * const { result } = await batchLinkProductsToCollectionWorkflow(container)
 * .run({
 *   input: {
 *     id: "pcol_123",
 *     add: ["prod_123"],
 *     remove: ["prod_456"],
 *   }
 * })
 *
 * @summary
 *
 * Manage the links between a collection and products.
 */
exports.batchLinkProductsToCollectionWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.batchLinkProductsToCollectionWorkflowId, (input) => {
    return (0, batch_link_products_collection_1.batchLinkProductsToCollectionStep)(input);
});
//# sourceMappingURL=batch-link-products-collection.js.map