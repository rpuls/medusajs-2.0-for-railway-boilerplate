"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRegionsStep = exports.createRegionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createRegionsStepId = "create-regions";
/**
 * This step creates one or more regions.
 *
 * @example
 * const data = createRegionsStep([
 *   {
 *     currency_code: "usd",
 *     name: "United States",
 *     countries: ["us"],
 *   }
 * ])
 */
exports.createRegionsStep = (0, workflows_sdk_1.createStep)(exports.createRegionsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.REGION);
    const created = await service.createRegions(data);
    return new workflows_sdk_1.StepResponse(created, created.map((region) => region.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.REGION);
    await service.deleteRegions(createdIds);
});
//# sourceMappingURL=create-regions.js.map