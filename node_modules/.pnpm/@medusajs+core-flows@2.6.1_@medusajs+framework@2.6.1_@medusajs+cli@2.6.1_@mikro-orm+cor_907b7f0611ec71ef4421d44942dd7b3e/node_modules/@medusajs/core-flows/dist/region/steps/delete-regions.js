"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRegionsStep = exports.deleteRegionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteRegionsStepId = "delete-regions";
/**
 * This step deletes one or more regions.
 */
exports.deleteRegionsStep = (0, workflows_sdk_1.createStep)(exports.deleteRegionsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.REGION);
    await service.softDeleteRegions(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.REGION);
    await service.restoreRegions(prevIds);
});
//# sourceMappingURL=delete-regions.js.map