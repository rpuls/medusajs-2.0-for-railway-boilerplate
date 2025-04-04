"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSalesChannelsWorkflow = exports.deleteSalesChannelsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const remove_remote_links_1 = require("../../common/steps/remove-remote-links");
const delete_sales_channels_1 = require("../steps/delete-sales-channels");
const steps_1 = require("../steps");
exports.deleteSalesChannelsWorkflowId = "delete-sales-channels";
/**
 * This workflow deletes one or more sales channels. It's used by the
 * [Delete Sales Channel Admin API Route](https://docs.medusajs.com/api/admin#sales-channels_deletesaleschannelsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete sales channels within your custom flows.
 *
 * @example
 * const { result } = await deleteSalesChannelsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["sc_123"],
 *   }
 * })
 *
 * @summary
 *
 * Delete sales channels.
 */
exports.deleteSalesChannelsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteSalesChannelsWorkflowId, (input) => {
    (0, steps_1.canDeleteSalesChannelsOrThrowStep)({ ids: input.ids });
    (0, delete_sales_channels_1.deleteSalesChannelsStep)(input.ids);
    (0, remove_remote_links_1.removeRemoteLinkStep)({
        [utils_1.Modules.SALES_CHANNEL]: { sales_channel_id: input.ids },
    });
    const salesChannelsIdEvents = (0, workflows_sdk_1.transform)({ input }, ({ input }) => {
        return input.ids?.map((id) => {
            return { id };
        });
    });
    (0, common_1.emitEventStep)({
        eventName: utils_1.SalesChannelWorkflowEvents.DELETED,
        data: salesChannelsIdEvents,
    });
});
//# sourceMappingURL=delete-sales-channels.js.map