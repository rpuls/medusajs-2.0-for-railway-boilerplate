"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaxRateRulesStep = exports.createTaxRateRulesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createTaxRateRulesStepId = "create-tax-rate-rules";
/**
 * This step creates one or more tax rate rules.
 *
 * @example
 * const data = createTaxRateRulesStep([
 *   {
 *     reference: "product_type",
 *     reference_id: "ptyp_123",
 *     tax_rate_id: "txr_123"
 *   }
 * ])
 */
exports.createTaxRateRulesStep = (0, workflows_sdk_1.createStep)(exports.createTaxRateRulesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.TAX);
    const created = await service.createTaxRateRules(data);
    return new workflows_sdk_1.StepResponse(created, created.map((rule) => rule.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.TAX);
    await service.deleteTaxRateRules(createdIds);
});
//# sourceMappingURL=create-tax-rate-rules.js.map