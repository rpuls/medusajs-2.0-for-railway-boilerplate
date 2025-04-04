"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOneOrAnyRegionStep = exports.findOneOrAnyRegionStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.findOneOrAnyRegionStepId = "find-one-or-any-region";
/**
 * This step retrieves a region either by the provided ID or the first region in the first store.
 */
exports.findOneOrAnyRegionStep = (0, workflows_sdk_1.createStep)(exports.findOneOrAnyRegionStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.REGION);
    const storeModule = container.resolve(utils_1.Modules.STORE);
    if (data.regionId) {
        try {
            const region = await service.retrieveRegion(data.regionId, {
                relations: ["countries"],
            });
            return new workflows_sdk_1.StepResponse(region);
        }
        catch (error) {
            return new workflows_sdk_1.StepResponse(null);
        }
    }
    const [store] = await storeModule.listStores();
    if (!store) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Store not found");
    }
    const [region] = await service.listRegions({
        id: store.default_region_id,
    }, { relations: ["countries"] });
    if (!region) {
        return new workflows_sdk_1.StepResponse(null);
    }
    return new workflows_sdk_1.StepResponse(region);
});
//# sourceMappingURL=find-one-or-any-region.js.map