"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultSalesChannelStep = exports.createDefaultSalesChannelStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createDefaultSalesChannelStepId = "create-default-sales-channel";
/**
 * This step creates a default sales channel if none exist in the application.
 * This is useful when creating seed scripts.
 *
 * @example
 * const data = createDefaultSalesChannelStep({
 *   data: {
 *     name: "Webshop",
 *   }
 * })
 */
exports.createDefaultSalesChannelStep = (0, workflows_sdk_1.createStep)(exports.createDefaultSalesChannelStepId, async (input, { container }) => {
    const salesChannelService = container.resolve(utils_1.Modules.SALES_CHANNEL);
    if (!salesChannelService) {
        return new workflows_sdk_1.StepResponse(void 0);
    }
    let shouldDelete = false;
    let [salesChannel] = await salesChannelService.listSalesChannels({}, { take: 1 });
    if (!salesChannel) {
        salesChannel = await salesChannelService.createSalesChannels(input.data);
        shouldDelete = true;
    }
    return new workflows_sdk_1.StepResponse(salesChannel, { id: salesChannel.id, shouldDelete });
}, async (data, { container }) => {
    if (!data?.id || !data.shouldDelete) {
        return;
    }
    const service = container.resolve(utils_1.Modules.SALES_CHANNEL);
    await service.deleteSalesChannels(data.id);
});
//# sourceMappingURL=create-default-sales-channel.js.map