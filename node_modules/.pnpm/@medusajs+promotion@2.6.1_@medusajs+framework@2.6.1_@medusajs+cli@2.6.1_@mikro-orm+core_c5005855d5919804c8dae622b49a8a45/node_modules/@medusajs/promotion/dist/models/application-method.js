"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const promotion_1 = __importDefault(require("./promotion"));
const promotion_rule_1 = __importDefault(require("./promotion-rule"));
const ApplicationMethod = utils_1.model
    .define({ name: "ApplicationMethod", tableName: "promotion_application_method" }, {
    id: utils_1.model.id({ prefix: "proappmet" }).primaryKey(),
    value: utils_1.model.bigNumber().nullable(),
    currency_code: utils_1.model.text().nullable(),
    max_quantity: utils_1.model.number().nullable(),
    apply_to_quantity: utils_1.model.number().nullable(),
    buy_rules_min_quantity: utils_1.model.number().nullable(),
    type: utils_1.model
        .enum(utils_1.PromotionUtils.ApplicationMethodType)
        .index("IDX_application_method_type"),
    target_type: utils_1.model
        .enum(utils_1.PromotionUtils.ApplicationMethodTargetType)
        .index("IDX_application_method_target_type"),
    allocation: utils_1.model
        .enum(utils_1.PromotionUtils.ApplicationMethodAllocation)
        .index("IDX_application_method_allocation")
        .nullable(),
    promotion: utils_1.model.belongsTo(() => promotion_1.default, {
        mappedBy: "application_method",
    }),
    target_rules: utils_1.model.manyToMany(() => promotion_rule_1.default, {
        pivotTable: "application_method_target_rules",
        mappedBy: "method_target_rules",
    }),
    buy_rules: utils_1.model.manyToMany(() => promotion_rule_1.default, {
        pivotTable: "application_method_buy_rules",
        mappedBy: "method_buy_rules",
    }),
})
    .indexes([
    {
        on: ["currency_code"],
        where: "deleted_at IS NOT NULL",
    },
]);
exports.default = ApplicationMethod;
//# sourceMappingURL=application-method.js.map