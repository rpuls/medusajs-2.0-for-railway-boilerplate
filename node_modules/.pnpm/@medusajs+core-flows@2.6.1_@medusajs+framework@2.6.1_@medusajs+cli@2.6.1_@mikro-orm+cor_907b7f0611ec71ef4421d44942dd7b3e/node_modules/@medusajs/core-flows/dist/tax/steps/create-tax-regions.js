"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaxRegionsStep = exports.createTaxRegionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createTaxRegionsStepId = "create-tax-regions";
/**
 * This step creates one or more tax regions.
 *
 * @example
 * const data = createTaxRegionsStep([
 *   {
 *     country_code: "us",
 *   }
 * ])
 */
exports.createTaxRegionsStep = (0, workflows_sdk_1.createStep)(exports.createTaxRegionsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.TAX);
    const created = await service.createTaxRegions(data);
    return new workflows_sdk_1.StepResponse(created, created.map((region) => region.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.TAX);
    await service.deleteTaxRegions(createdIds);
});
//# sourceMappingURL=create-tax-regions.js.map