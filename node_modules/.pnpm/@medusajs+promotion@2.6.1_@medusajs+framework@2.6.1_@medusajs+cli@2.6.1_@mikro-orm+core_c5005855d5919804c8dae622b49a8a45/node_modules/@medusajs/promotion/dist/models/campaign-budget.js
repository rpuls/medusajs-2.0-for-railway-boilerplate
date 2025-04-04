"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const campaign_1 = __importDefault(require("./campaign"));
const CampaignBudget = utils_1.model.define({ name: "CampaignBudget", tableName: "promotion_campaign_budget" }, {
    id: utils_1.model.id({ prefix: "probudg" }).primaryKey(),
    type: utils_1.model
        .enum(utils_1.PromotionUtils.CampaignBudgetType)
        .index("IDX_campaign_budget_type"),
    currency_code: utils_1.model.text().nullable(),
    limit: utils_1.model.bigNumber().nullable(),
    used: utils_1.model.bigNumber().default(0),
    campaign: utils_1.model.belongsTo(() => campaign_1.default, {
        mappedBy: "budget",
    }),
});
exports.default = CampaignBudget;
//# sourceMappingURL=campaign-budget.js.map