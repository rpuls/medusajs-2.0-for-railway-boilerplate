"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaxRatesStep = exports.createTaxRatesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createTaxRatesStepId = "create-tax-rates";
/**
 * This step creates one or more tax rates.
 *
 * @example
 * const data = createTaxRatesStep([
 *   {
 *     name: "Default",
 *     tax_region_id: "txreg_123",
 *   }
 * ])
 */
exports.createTaxRatesStep = (0, workflows_sdk_1.createStep)(exports.createTaxRatesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.TAX);
    const created = await service.createTaxRates(data);
    return new workflows_sdk_1.StepResponse(created, created.map((rate) => rate.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.TAX);
    await service.deleteTaxRates(createdIds);
});
//# sourceMappingURL=create-tax-rates.js.map