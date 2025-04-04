"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detachLocationsFromSalesChannelsStep = exports.detachLocationsFromSalesChannelsStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.detachLocationsFromSalesChannelsStepId = "detach-locations-from-sales-channels";
/**
 * This step dismisses links between stock location and sales channel records.
 *
 * @example
 * const data = detachLocationsFromSalesChannelsStep({
 *   links: [
 *     {
 *       sales_channel_id: "sc_123",
 *       location_id: "sloc_123"
 *     }
 *   ]
 * })
 */
exports.detachLocationsFromSalesChannelsStep = (0, workflows_sdk_1.createStep)(exports.detachLocationsFromSalesChannelsStepId, async (data, { container }) => {
    if (!data.links?.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const links = data.links.map((link) => {
        return {
            [utils_1.Modules.SALES_CHANNEL]: {
                sales_channel_id: link.sales_channel_id,
            },
            [utils_1.Modules.STOCK_LOCATION]: {
                stock_location_id: link.location_id,
            },
        };
    });
    await remoteLink.dismiss(links);
    return new workflows_sdk_1.StepResponse(void 0, links);
}, async (links, { container }) => {
    if (!links?.length) {
        return;
    }
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    await remoteLink.create(links);
});
//# sourceMappingURL=detach-locations-from-channels.js.map