"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSalesChannelsStep = exports.deleteSalesChannelsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteSalesChannelsStepId = "delete-sales-channels";
/**
 * This step deletes one or more sales channels.
 */
exports.deleteSalesChannelsStep = (0, workflows_sdk_1.createStep)(exports.deleteSalesChannelsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.SALES_CHANNEL);
    await service.softDeleteSalesChannels(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevSalesChannelIds, { container }) => {
    if (!prevSalesChannelIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.SALES_CHANNEL);
    await service.restoreSalesChannels(prevSalesChannelIds);
});
//# sourceMappingURL=delete-sales-channels.js.map