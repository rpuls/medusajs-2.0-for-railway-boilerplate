"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const promotion_rule_1 = __importDefault(require("./promotion-rule"));
const PromotionRuleValue = utils_1.model.define({ name: "PromotionRuleValue", tableName: "promotion_rule_value" }, {
    id: utils_1.model.id({ prefix: "prorulval" }).primaryKey(),
    value: utils_1.model.text(),
    promotion_rule: utils_1.model.belongsTo(() => promotion_rule_1.default, {
        mappedBy: "values",
    }),
});
exports.default = PromotionRuleValue;
//# sourceMappingURL=promotion-rule-value.js.map