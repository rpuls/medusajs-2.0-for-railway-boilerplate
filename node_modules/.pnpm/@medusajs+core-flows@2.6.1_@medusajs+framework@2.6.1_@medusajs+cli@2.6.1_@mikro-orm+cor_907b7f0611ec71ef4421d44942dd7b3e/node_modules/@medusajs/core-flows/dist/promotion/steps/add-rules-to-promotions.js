"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRulesToPromotionsStep = exports.addRulesToPromotionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.addRulesToPromotionsStepId = "add-rules-to-promotions";
/**
 * This step adds rules to a promotion.
 *
 * @example
 * const data = addRulesToPromotionsStep({
 *   // import { RuleType } from "@medusajs/framework/utils"
 *   rule_type: RuleType.RULES,
 *   data: {
 *     id: "promo_123",
 *     rules: [
 *       {
 *         attribute: "customer_group",
 *         operator: "eq",
 *         values: "custgrp_123"
 *       }
 *     ]
 *   }
 * })
 */
exports.addRulesToPromotionsStep = (0, workflows_sdk_1.createStep)(exports.addRulesToPromotionsStepId, async (input, { container }) => {
    const { data, rule_type: ruleType } = input;
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    const createdPromotionRules = ruleType === utils_1.RuleType.RULES
        ? await promotionModule.addPromotionRules(data.id, data.rules)
        : [];
    const createdPromotionBuyRules = ruleType === utils_1.RuleType.BUY_RULES
        ? await promotionModule.addPromotionBuyRules(data.id, data.rules)
        : [];
    const createdPromotionTargetRules = ruleType === utils_1.RuleType.TARGET_RULES
        ? await promotionModule.addPromotionTargetRules(data.id, data.rules)
        : [];
    const promotionRules = [
        ...createdPromotionRules,
        ...createdPromotionBuyRules,
        ...createdPromotionTargetRules,
    ];
    return new workflows_sdk_1.StepResponse(promotionRules, {
        id: data.id,
        promotionRuleIds: createdPromotionRules.map((pr) => pr.id),
        buyRuleIds: createdPromotionBuyRules.map((pr) => pr.id),
        targetRuleIds: createdPromotionBuyRules.map((pr) => pr.id),
    });
}, async (data, { container }) => {
    if (!data) {
        return;
    }
    const { id, promotionRuleIds = [], buyRuleIds = [], targetRuleIds = [], } = data;
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    promotionRuleIds.length &&
        (await promotionModule.removePromotionRules(id, promotionRuleIds));
    buyRuleIds.length &&
        (await promotionModule.removePromotionBuyRules(id, buyRuleIds));
    targetRuleIds.length &&
        (await promotionModule.removePromotionBuyRules(id, targetRuleIds));
});
//# sourceMappingURL=add-rules-to-promotions.js.map