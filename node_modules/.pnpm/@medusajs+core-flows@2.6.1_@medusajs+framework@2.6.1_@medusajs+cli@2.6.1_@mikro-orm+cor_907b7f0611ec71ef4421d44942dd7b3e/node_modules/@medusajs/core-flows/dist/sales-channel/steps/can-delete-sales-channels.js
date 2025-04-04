"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canDeleteSalesChannelsOrThrowStep = exports.canDeleteSalesChannelsOrThrowStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.canDeleteSalesChannelsOrThrowStepId = "can-delete-sales-channels-or-throw-step";
/**
 * This step validates that the specified sales channels can be deleted.
 * If any of the sales channels are default sales channels for a store,
 * the step will throw an error.
 *
 * @example
 * const data = canDeleteSalesChannelsOrThrowStep({
 *   ids: ["sc_123"]
 * })
 */
exports.canDeleteSalesChannelsOrThrowStep = (0, workflows_sdk_1.createStep)(exports.canDeleteSalesChannelsOrThrowStepId, async ({ ids }, { container }) => {
    const salesChannelIdsToDelete = Array.isArray(ids) ? ids : [ids];
    const storeModule = await container.resolve(utils_1.Modules.STORE);
    const stores = await storeModule.listStores({
        default_sales_channel_id: salesChannelIdsToDelete,
    }, {
        select: ["default_sales_channel_id"],
    });
    const defaultSalesChannelIds = stores.map((s) => s.default_sales_channel_id);
    if (defaultSalesChannelIds.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot delete default sales channels: ${defaultSalesChannelIds.join(", ")}`);
    }
    return new workflows_sdk_1.StepResponse(true);
});
//# sourceMappingURL=can-delete-sales-channels.js.map