"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSalesChannelsStep = exports.createSalesChannelsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createSalesChannelsStepId = "create-sales-channels";
/**
 * This step creates one or more sales channels.
 *
 * @example
 * const data = createSalesChannelsStep({
 *   data: [{
 *     name: "Webshop",
 *   }]
 * })
 */
exports.createSalesChannelsStep = (0, workflows_sdk_1.createStep)(exports.createSalesChannelsStepId, async (input, { container }) => {
    const salesChannelService = container.resolve(utils_1.Modules.SALES_CHANNEL);
    const salesChannels = await salesChannelService.createSalesChannels(input.data);
    return new workflows_sdk_1.StepResponse(salesChannels, salesChannels.map((s) => s.id));
}, async (createdIds, { container }) => {
    if (!createdIds) {
        return;
    }
    const service = container.resolve(utils_1.Modules.SALES_CHANNEL);
    await service.deleteSalesChannels(createdIds);
});
//# sourceMappingURL=create-sales-channels.js.map