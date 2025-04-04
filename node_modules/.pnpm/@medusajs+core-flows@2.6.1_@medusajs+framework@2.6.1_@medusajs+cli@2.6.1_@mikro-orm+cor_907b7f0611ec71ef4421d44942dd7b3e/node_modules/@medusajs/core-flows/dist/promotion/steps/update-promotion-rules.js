"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePromotionRulesStep = exports.updatePromotionRulesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updatePromotionRulesStepId = "update-promotion-rules";
/**
 * This step updates one or more promotion rules.
 *
 * @example
 * const data = updatePromotionRulesStep({
 *   data: [
 *     {
 *       id: "prule_123",
 *       attribute: "customer_group"
 *     }
 *   ]
 * })
 */
exports.updatePromotionRulesStep = (0, workflows_sdk_1.createStep)(exports.updatePromotionRulesStepId, async (input, { container }) => {
    const { data } = input;
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    const promotionRulesBeforeUpdate = await promotionModule.listPromotionRules({ id: data.map((d) => d.id) }, { relations: ["values"] });
    const updatedPromotionRules = await promotionModule.updatePromotionRules(data);
    return new workflows_sdk_1.StepResponse(updatedPromotionRules, promotionRulesBeforeUpdate);
}, async (updatedPromotionRules, { container }) => {
    if (!updatedPromotionRules?.length) {
        return;
    }
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    await promotionModule.updatePromotionRules(updatedPromotionRules.map((rule) => ({
        id: rule.id,
        description: rule.description,
        attribute: rule.attribute,
        operator: rule.operator,
        values: rule.values.map((v) => v.value),
    })));
});
//# sourceMappingURL=update-promotion-rules.js.map