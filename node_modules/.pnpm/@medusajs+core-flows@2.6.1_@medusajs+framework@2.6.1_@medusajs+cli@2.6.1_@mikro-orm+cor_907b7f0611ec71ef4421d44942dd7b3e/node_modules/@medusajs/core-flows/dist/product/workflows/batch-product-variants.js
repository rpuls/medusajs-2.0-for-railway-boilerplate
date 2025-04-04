"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchProductVariantsWorkflow = exports.batchProductVariantsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const create_product_variants_1 = require("./create-product-variants");
const update_product_variants_1 = require("./update-product-variants");
const delete_product_variants_1 = require("./delete-product-variants");
exports.batchProductVariantsWorkflowId = "batch-product-variants";
/**
 * This workflow creates, updates, and deletes product variants. It's used by the
 * [Manage Variants in a Product Admin API Route](https://docs.medusajs.com/api/admin#products_postproductsidvariantsbatch).
 *
 * You can use this workflow within your own customizations or custom workflows to manage the variants of a product. You can also
 * use this within a [seed script](https://docs.medusajs.com/learn/fundamentals/custom-cli-scripts/seed-data) or in a custom import script.
 *
 * @example
 * const { result } = await batchProductVariantsWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         title: "Small Shirt",
 *         product_id: "prod_123",
 *         options: {
 *           Size: "S"
 *         },
 *         prices: [
 *           {
 *             amount: 10,
 *             currency_code: "usd"
 *           }
 *         ]
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "variant_123",
 *         title: "Red Pants"
 *       }
 *     ],
 *     delete: ["variant_321"]
 *   }
 * })
 *
 * @summary
 *
 * Create, update, and delete product variants.
 */
exports.batchProductVariantsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.batchProductVariantsWorkflowId, (input) => {
    const normalizedInput = (0, workflows_sdk_1.transform)({ input }, (data) => {
        return {
            create: data.input.create ?? [],
            update: data.input.update ?? [],
            delete: data.input.delete ?? [],
        };
    });
    const res = (0, workflows_sdk_1.parallelize)(create_product_variants_1.createProductVariantsWorkflow.runAsStep({
        input: { product_variants: normalizedInput.create },
    }), update_product_variants_1.updateProductVariantsWorkflow.runAsStep({
        input: { product_variants: normalizedInput.update },
    }), delete_product_variants_1.deleteProductVariantsWorkflow.runAsStep({
        input: { ids: normalizedInput.delete },
    }));
    const response = (0, workflows_sdk_1.transform)({ res, input }, (data) => {
        return {
            created: data.res[0],
            updated: data.res[1],
            deleted: data.input.delete ?? [],
        };
    });
    return new workflows_sdk_1.WorkflowResponse(response);
});
//# sourceMappingURL=batch-product-variants.js.map