"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const application_method_1 = __importDefault(require("./application-method"));
const promotion_1 = __importDefault(require("./promotion"));
const promotion_rule_value_1 = __importDefault(require("./promotion-rule-value"));
const PromotionRule = utils_1.model
    .define({
    name: "PromotionRule",
    tableName: "promotion_rule",
}, {
    id: utils_1.model.id({ prefix: "prorul" }).primaryKey(),
    description: utils_1.model.text().nullable(),
    attribute: utils_1.model.text().index("IDX_promotion_rule_attribute"),
    operator: utils_1.model
        .enum(utils_1.PromotionUtils.PromotionRuleOperator)
        .index("IDX_promotion_rule_operator"),
    values: utils_1.model.hasMany(() => promotion_rule_value_1.default, {
        mappedBy: "promotion_rule",
    }),
    promotions: utils_1.model.manyToMany(() => promotion_1.default, {
        mappedBy: "rules",
    }),
    method_target_rules: utils_1.model.manyToMany(() => application_method_1.default, {
        mappedBy: "target_rules",
    }),
    method_buy_rules: utils_1.model.manyToMany(() => application_method_1.default, {
        mappedBy: "buy_rules",
    }),
})
    .cascades({
    delete: ["values"],
});
exports.default = PromotionRule;
//# sourceMappingURL=promotion-rule.js.map