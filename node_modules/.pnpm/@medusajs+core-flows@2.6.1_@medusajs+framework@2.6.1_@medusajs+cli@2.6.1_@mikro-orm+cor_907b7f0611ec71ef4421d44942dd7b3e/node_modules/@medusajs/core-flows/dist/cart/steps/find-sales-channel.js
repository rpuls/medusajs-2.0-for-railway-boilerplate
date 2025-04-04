"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSalesChannelStep = exports.findSalesChannelStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.findSalesChannelStepId = "find-sales-channel";
/**
 * This step either retrieves a sales channel either using the ID provided as an input, or, if no ID
 * is provided, the default sales channel of the first store.
 */
exports.findSalesChannelStep = (0, workflows_sdk_1.createStep)(exports.findSalesChannelStepId, async (data, { container }) => {
    const salesChannelService = container.resolve(utils_1.Modules.SALES_CHANNEL);
    const storeModule = container.resolve(utils_1.Modules.STORE);
    let salesChannel;
    if (data.salesChannelId) {
        salesChannel = await salesChannelService.retrieveSalesChannel(data.salesChannelId);
    }
    else if (!(0, utils_1.isDefined)(data.salesChannelId)) {
        const [store] = await storeModule.listStores({}, { select: ["default_sales_channel_id"] });
        if (store?.default_sales_channel_id) {
            salesChannel = await salesChannelService.retrieveSalesChannel(store.default_sales_channel_id);
        }
    }
    if (!salesChannel) {
        return new workflows_sdk_1.StepResponse(null);
    }
    if (salesChannel?.is_disabled) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Unable to assign cart to disabled Sales Channel: ${salesChannel.name}`);
    }
    return new workflows_sdk_1.StepResponse(salesChannel);
});
//# sourceMappingURL=find-sales-channel.js.map