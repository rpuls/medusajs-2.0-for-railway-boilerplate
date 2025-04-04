"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkProductsToSalesChannelWorkflow = exports.linkProductsToSalesChannelWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const associate_products_with_channels_1 = require("../steps/associate-products-with-channels");
const workflows_sdk_2 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.linkProductsToSalesChannelWorkflowId = "link-products-to-sales-channel";
/**
 * This workflow manages the products available in a sales channel. It's used by the
 * [Manage Products Admin API Route](https://docs.medusajs.com/api/admin#sales-channels_postsaleschannelsidproducts).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage the products available in a sales channel within your custom flows.
 *
 * @example
 * const { result } = await linkProductsToSalesChannelWorkflow(container)
 * .run({
 *   input: {
 *     id: "sc_123",
 *     add: ["prod_123"],
 *     remove: ["prod_321"]
 *   }
 * })
 *
 * @summary
 *
 * Manage the products available in a sales channel.
 */
exports.linkProductsToSalesChannelWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.linkProductsToSalesChannelWorkflowId, (input) => {
    const toAdd = (0, workflows_sdk_2.transform)({ input }, (data) => {
        return data.input.add?.map((productId) => ({
            sales_channel_id: data.input.id,
            product_id: productId,
        }));
    });
    const toRemove = (0, workflows_sdk_2.transform)({ input }, (data) => {
        return data.input.remove?.map((productId) => ({
            sales_channel_id: data.input.id,
            product_id: productId,
        }));
    });
    (0, associate_products_with_channels_1.associateProductsWithSalesChannelsStep)({ links: toAdd });
    (0, steps_1.detachProductsFromSalesChannelsStep)({ links: toRemove });
});
//# sourceMappingURL=link-products-to-sales-channel.js.map