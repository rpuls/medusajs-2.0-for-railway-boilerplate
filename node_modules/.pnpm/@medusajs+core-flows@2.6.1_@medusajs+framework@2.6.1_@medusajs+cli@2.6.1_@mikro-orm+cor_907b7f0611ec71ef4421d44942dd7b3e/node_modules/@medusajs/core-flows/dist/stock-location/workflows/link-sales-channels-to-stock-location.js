"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkSalesChannelsToStockLocationWorkflow = exports.linkSalesChannelsToStockLocationWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const workflows_sdk_2 = require("@medusajs/framework/workflows-sdk");
const sales_channel_1 = require("../../sales-channel");
exports.linkSalesChannelsToStockLocationWorkflowId = "link-sales-channels-to-stock-location";
/**
 * This workflow manages the sales channels of a stock location. It's used by the
 * [Manage Sales Channels Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_poststocklocationsidsaleschannels).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to manage the sales channels of a stock location in your custom flows.
 *
 * @example
 * const { result } = await linkSalesChannelsToStockLocationWorkflow(container)
 * .run({
 *   input: {
 *     id: "sloc_123",
 *     add: ["sc_123"],
 *     remove: ["sc_321"]
 *   }
 * })
 *
 * @summary
 *
 * Manage the sales channels of a stock location.
 */
exports.linkSalesChannelsToStockLocationWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.linkSalesChannelsToStockLocationWorkflowId, (input) => {
    const toAdd = (0, workflows_sdk_2.transform)({ input }, (data) => {
        return data.input.add?.map((salesChannelId) => ({
            sales_channel_id: salesChannelId,
            location_id: data.input.id,
        }));
    });
    const toRemove = (0, workflows_sdk_2.transform)({ input }, (data) => {
        return data.input.remove?.map((salesChannelId) => ({
            sales_channel_id: salesChannelId,
            location_id: data.input.id,
        }));
    });
    (0, sales_channel_1.associateLocationsWithSalesChannelsStep)({ links: toAdd });
    (0, sales_channel_1.detachLocationsFromSalesChannelsStep)({ links: toRemove });
});
//# sourceMappingURL=link-sales-channels-to-stock-location.js.map