"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaxRegionsStep = exports.deleteTaxRegionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteTaxRegionsStepId = "delete-tax-regions";
/**
 * This step deletes one or more tax regions.
 */
exports.deleteTaxRegionsStep = (0, workflows_sdk_1.createStep)(exports.deleteTaxRegionsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.TAX);
    await service.softDeleteTaxRegions(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.TAX);
    await service.restoreTaxRegions(prevIds);
});
//# sourceMappingURL=delete-tax-regions.js.map