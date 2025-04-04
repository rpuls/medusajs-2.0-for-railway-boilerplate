"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSalesChannelsStep = exports.updateSalesChannelsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateSalesChannelsStepId = "update-sales-channels";
/**
 * This step updates sales channels matching the specified filters.
 *
 * @example
 * const data = updateSalesChannelsStep({
 *   selector: {
 *     id: "sc_123"
 *   },
 *   update: {
 *     name: "Webshop"
 *   }
 * })
 */
exports.updateSalesChannelsStep = (0, workflows_sdk_1.createStep)(exports.updateSalesChannelsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.SALES_CHANNEL);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listSalesChannels(data.selector, {
        select: selects,
        relations,
    });
    const channels = await service.updateSalesChannels(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(channels, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.SALES_CHANNEL);
    await service.upsertSalesChannels(prevData.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        is_disabled: r.is_disabled,
        metadata: r.metadata,
    })));
});
//# sourceMappingURL=update-sales-channels.js.map