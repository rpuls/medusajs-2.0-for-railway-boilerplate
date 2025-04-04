"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const PricePreference = utils_1.model
    .define("PricePreference", {
    id: utils_1.model.id({ prefix: "prpref" }).primaryKey(),
    attribute: utils_1.model.text(),
    value: utils_1.model.text().nullable(),
    is_tax_inclusive: utils_1.model.boolean().default(false),
})
    .indexes([
    {
        name: "IDX_price_preference_attribute_value",
        on: ["attribute", "value"],
        unique: true,
        where: "deleted_at IS NULL",
    },
]);
exports.default = PricePreference;
//# sourceMappingURL=price-preference.js.map