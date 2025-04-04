"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRegionsStep = exports.updateRegionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateRegionsStepId = "update-region";
/**
 * This step updates regions matching the specified filters.
 *
 * @example
 * const data = updateRegionsStep({
 *   selector: {
 *     id: "reg_123"
 *   },
 *   update: {
 *     name: "United States"
 *   }
 * })
 */
exports.updateRegionsStep = (0, workflows_sdk_1.createStep)(exports.updateRegionsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.REGION);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listRegions(data.selector, {
        select: selects,
        relations,
    });
    if (Object.keys(data.update).length === 0) {
        return new workflows_sdk_1.StepResponse(prevData, []);
    }
    const regions = await service.updateRegions(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(regions, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.REGION);
    await service.upsertRegions(prevData.map((r) => ({
        id: r.id,
        name: r.name,
        currency_code: r.currency_code,
        metadata: r.metadata,
        countries: r.countries?.map((c) => c.iso_2),
    })));
});
//# sourceMappingURL=update-regions.js.map