"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const campaign_budget_1 = __importDefault(require("./campaign-budget"));
const promotion_1 = __importDefault(require("./promotion"));
const Campaign = utils_1.model
    .define({ name: "Campaign", tableName: "promotion_campaign" }, {
    id: utils_1.model.id({ prefix: "procamp" }).primaryKey(),
    name: utils_1.model.text().searchable(),
    description: utils_1.model.text().searchable().nullable(),
    campaign_identifier: utils_1.model.text(),
    starts_at: utils_1.model.dateTime().nullable(),
    ends_at: utils_1.model.dateTime().nullable(),
    budget: utils_1.model
        .hasOne(() => campaign_budget_1.default, {
        mappedBy: "campaign",
    })
        .nullable(),
    promotions: utils_1.model.hasMany(() => promotion_1.default, {
        mappedBy: "campaign",
    }),
})
    .cascades({
    delete: ["budget"],
})
    .indexes([
    {
        on: ["campaign_identifier"],
        unique: true,
        where: "deleted_at IS NULL",
    },
]);
exports.default = Campaign;
//# sourceMappingURL=campaign.js.map