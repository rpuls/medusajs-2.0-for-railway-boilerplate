"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSalesChannelsWorkflow = exports.updateSalesChannelsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const update_sales_channels_1 = require("../steps/update-sales-channels");
exports.updateSalesChannelsWorkflowId = "update-sales-channels";
/**
 * This workflow updates sales channels matching the specified conditions. It's used by the
 * [Update Sales Channel Admin API Route](https://docs.medusajs.com/api/admin#sales-channels_postsaleschannelsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update sales channels within your custom flows.
 *
 * @example
 * const { result } = await updateSalesChannelsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "sc_123"
 *     },
 *     update: {
 *       name: "Webshop"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update sales channels.
 */
exports.updateSalesChannelsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateSalesChannelsWorkflowId, (input) => {
    const updatedSalesChannels = (0, update_sales_channels_1.updateSalesChannelsStep)(input);
    const salesChannelIdEvents = (0, workflows_sdk_1.transform)({ updatedSalesChannels }, ({ updatedSalesChannels }) => {
        const arr = Array.isArray(updatedSalesChannels)
            ? updatedSalesChannels
            : [updatedSalesChannels];
        return arr?.map((salesChannel) => {
            return { id: salesChannel.id };
        });
    });
    (0, common_1.emitEventStep)({
        eventName: utils_1.SalesChannelWorkflowEvents.UPDATED,
        data: salesChannelIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedSalesChannels);
});
//# sourceMappingURL=update-sales-channels.js.map