"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingOptionRule = void 0;
const utils_1 = require("@medusajs/framework/utils");
const shipping_option_1 = require("./shipping-option");
exports.ShippingOptionRule = utils_1.model.define("shipping_option_rule", {
    id: utils_1.model.id({ prefix: "sorul" }).primaryKey(),
    attribute: utils_1.model.text(),
    operator: utils_1.model.enum(utils_1.RuleOperator),
    value: utils_1.model.json().nullable(),
    shipping_option: utils_1.model.belongsTo(() => shipping_option_1.ShippingOption, {
        mappedBy: "rules",
    }),
});
//# sourceMappingURL=shipping-option-rule.js.map