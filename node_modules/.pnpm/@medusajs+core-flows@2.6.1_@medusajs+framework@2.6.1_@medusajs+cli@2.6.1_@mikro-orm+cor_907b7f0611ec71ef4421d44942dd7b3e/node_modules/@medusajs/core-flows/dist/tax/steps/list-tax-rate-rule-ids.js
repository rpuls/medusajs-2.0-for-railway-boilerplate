"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTaxRateRuleIdsStep = exports.listTaxRateRuleIdsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.listTaxRateRuleIdsStepId = "list-tax-rate-rule-ids";
/**
 * This step retrieves the IDs of tax rate rules matching the specified filters.
 *
 * @example
 * const data = listTaxRateRuleIdsStep({
 *   selector: {
 *     tax_rate_id: "txr_123"
 *   }
 * })
 */
exports.listTaxRateRuleIdsStep = (0, workflows_sdk_1.createStep)(exports.listTaxRateRuleIdsStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.TAX);
    const rules = await service.listTaxRateRules(input.selector, {
        select: ["id"],
    });
    return new workflows_sdk_1.StepResponse(rules.map((r) => r.id));
});
//# sourceMappingURL=list-tax-rate-rule-ids.js.map