"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSalesChannelsExistStep = exports.validateSalesChannelsExistStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.validateSalesChannelsExistStepId = "validate-sales-channels-exist";
/**
 * This step validates that a sales channel exists before linking it to an API key.
 * If the sales channel does not exist, the step throws an error.
 */
exports.validateSalesChannelsExistStep = (0, workflows_sdk_1.createStep)(exports.validateSalesChannelsExistStepId, async (data, { container }) => {
    const salesChannelModuleService = container.resolve(utils_1.Modules.SALES_CHANNEL);
    const salesChannels = await salesChannelModuleService.listSalesChannels({ id: data.sales_channel_ids }, { select: ["id"] });
    const salesChannelIds = salesChannels.map((v) => v.id);
    const notFound = (0, utils_1.arrayDifference)(data.sales_channel_ids, salesChannelIds);
    if (notFound.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Sales channels with IDs ${notFound.join(", ")} do not exist`);
    }
    return new workflows_sdk_1.StepResponse(salesChannelIds);
});
//# sourceMappingURL=validate-sales-channel-exists.js.map