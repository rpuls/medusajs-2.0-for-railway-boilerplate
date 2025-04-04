"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTaxRateIdsStep = exports.listTaxRateIdsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.listTaxRateIdsStepId = "list-tax-rate-ids";
/**
 * This step retrieves the IDs of tax rates matching the specified filters.
 *
 * @example
 * const data = listTaxRateIdsStep({
 *   selector: {
 *     tax_region_id: "txreg_123"
 *   }
 * })
 */
exports.listTaxRateIdsStep = (0, workflows_sdk_1.createStep)(exports.listTaxRateIdsStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.TAX);
    const rates = await service.listTaxRates(input.selector, {
        select: ["id"],
    });
    return new workflows_sdk_1.StepResponse(rates.map((r) => r.id));
});
//# sourceMappingURL=list-tax-rate-ids.js.map