"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeActionForBudgetExceeded = computeActionForBudgetExceeded;
const utils_1 = require("@medusajs/framework/utils");
function computeActionForBudgetExceeded(promotion, amount) {
    const campaignBudget = promotion.campaign?.budget;
    if (!campaignBudget) {
        return;
    }
    const campaignBudgetUsed = campaignBudget.used ?? 0;
    const totalUsed = campaignBudget.type === utils_1.CampaignBudgetType.SPEND
        ? utils_1.MathBN.add(campaignBudgetUsed, amount)
        : utils_1.MathBN.add(campaignBudgetUsed, 1);
    if (campaignBudget.limit && utils_1.MathBN.gt(totalUsed, campaignBudget.limit)) {
        return {
            action: utils_1.ComputedActions.CAMPAIGN_BUDGET_EXCEEDED,
            code: promotion.code,
        };
    }
}
//# sourceMappingURL=usage.js.map