"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.associateProductsWithSalesChannelsStep = exports.associateProductsWithSalesChannelsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.associateProductsWithSalesChannelsStepId = "associate-products-with-channels";
/**
 * This step creates links between products and sales channel records.
 *
 * @example
 * const data = associateProductsWithSalesChannelsStep({
 *   links: [
 *     {
 *       sales_channel_id: "sc_123",
 *       product_id: "prod_123"
 *     }
 *   ]
 * })
 */
exports.associateProductsWithSalesChannelsStep = (0, workflows_sdk_1.createStep)(exports.associateProductsWithSalesChannelsStepId, async (input, { container }) => {
    if (!input.links?.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const links = input.links.map((link) => {
        return {
            [utils_1.Modules.PRODUCT]: {
                product_id: link.product_id,
            },
            [utils_1.Modules.SALES_CHANNEL]: {
                sales_channel_id: link.sales_channel_id,
            },
        };
    });
    const createdLinks = await remoteLink.create(links);
    return new workflows_sdk_1.StepResponse(createdLinks, links);
}, async (links, { container }) => {
    if (!links) {
        return;
    }
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    await remoteLink.dismiss(links);
});
//# sourceMappingURL=associate-products-with-channels.js.map