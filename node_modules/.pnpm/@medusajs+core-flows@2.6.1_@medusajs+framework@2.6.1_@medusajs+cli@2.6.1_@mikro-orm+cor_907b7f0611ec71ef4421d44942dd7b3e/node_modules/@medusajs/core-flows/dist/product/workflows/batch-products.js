"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchProductsWorkflow = exports.batchProductsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const create_products_1 = require("./create-products");
const delete_products_1 = require("./delete-products");
const update_products_1 = require("./update-products");
const conditionallyCreateProducts = (input) => (0, workflows_sdk_1.when)({ input }, ({ input }) => !!input.create?.length).then(() => create_products_1.createProductsWorkflow.runAsStep({ input: { products: input.create } }));
const conditionallyUpdateProducts = (input) => (0, workflows_sdk_1.when)({ input }, ({ input }) => !!input.update?.length).then(() => update_products_1.updateProductsWorkflow.runAsStep({ input: { products: input.update } }));
const conditionallyDeleteProducts = (input) => (0, workflows_sdk_1.when)({ input }, ({ input }) => !!input.delete?.length).then(() => delete_products_1.deleteProductsWorkflow.runAsStep({ input: { ids: input.delete } }));
exports.batchProductsWorkflowId = "batch-products";
/**
 * This workflow creates, updates, or deletes products. It's used by the
 * [Manage Products Admin API Route](https://docs.medusajs.com/api/admin#products_postproductsbatch).
 *
 * You can use this workflow within your own customizations or custom workflows to manage products in bulk. This is
 * also useful when writing a [seed script](https://docs.medusajs.com/learn/fundamentals/custom-cli-scripts/seed-data) or a custom import script.
 *
 * @example
 * const { result } = await batchProductsWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         title: "Shirt",
 *         options: [
 *           {
 *             title: "Color",
 *             values: ["Red", "Brown"]
 *           }
 *         ],
 *         variants: [
 *           {
 *             title: "Red Shirt",
 *             options: {
 *               "Color": "Red"
 *             },
 *             prices: [
 *               {
 *                 amount: 10,
 *                 currency_code: "usd"
 *               }
 *             ]
 *           }
 *         ]
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "prod_123",
 *         title: "Pants"
 *       }
 *     ],
 *     delete: ["prod_321"]
 *   }
 * })
 *
 * @summary
 *
 * Manage products in bulk.
 */
exports.batchProductsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.batchProductsWorkflowId, (input) => {
    const res = (0, workflows_sdk_1.parallelize)(conditionallyCreateProducts(input), conditionallyUpdateProducts(input), conditionallyDeleteProducts(input));
    return new workflows_sdk_1.WorkflowResponse((0, workflows_sdk_1.transform)({ res, input }, (data) => {
        return {
            created: data.res[0] ?? [],
            updated: data.res[1] ?? [],
            deleted: data.input.delete ?? [],
        };
    }));
});
//# sourceMappingURL=batch-products.js.map