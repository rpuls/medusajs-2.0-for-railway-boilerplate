"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaxRatesStep = exports.deleteTaxRatesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteTaxRatesStepId = "delete-tax-rates";
/**
 * This step deletes one or more tax rates.
 */
exports.deleteTaxRatesStep = (0, workflows_sdk_1.createStep)(exports.deleteTaxRatesStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.TAX);
    await service.softDeleteTaxRates(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.TAX);
    await service.restoreTaxRates(prevIds);
});
//# sourceMappingURL=delete-tax-rates.js.map