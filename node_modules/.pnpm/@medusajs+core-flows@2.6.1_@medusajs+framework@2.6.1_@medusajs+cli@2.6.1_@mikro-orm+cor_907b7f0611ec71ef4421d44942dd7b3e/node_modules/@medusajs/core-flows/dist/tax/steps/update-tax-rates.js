"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaxRatesStep = exports.updateTaxRatesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateTaxRatesStepId = "update-tax-rates";
/**
 * This step updates tax rates matching the specified filters.
 *
 * @example
 * const data = updateTaxRatesStep({
 *   selector: {
 *     id: "txr_123"
 *   },
 *   update: {
 *     name: "Default Tax Rate",
 *   }
 * })
 */
exports.updateTaxRatesStep = (0, workflows_sdk_1.createStep)(exports.updateTaxRatesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.TAX);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listTaxRates(data.selector, {
        select: selects,
        relations,
    });
    const taxRates = await service.updateTaxRates(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(taxRates, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.TAX);
    await service.upsertTaxRates(prevData);
});
//# sourceMappingURL=update-tax-rates.js.map