"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const index_1 = require("./index");
const ProductOptionValue = utils_1.model
    .define("ProductOptionValue", {
    id: utils_1.model.id({ prefix: "optval" }).primaryKey(),
    value: utils_1.model.text(),
    metadata: utils_1.model.json().nullable(),
    option: utils_1.model
        .belongsTo(() => index_1.ProductOption, {
        mappedBy: "values",
    })
        .nullable(),
    variants: utils_1.model.manyToMany(() => index_1.ProductVariant, {
        mappedBy: "options",
    }),
})
    .indexes([
    {
        name: "IDX_option_value_option_id_unique",
        on: ["option_id", "value"],
        unique: true,
        where: "deleted_at IS NULL",
    },
]);
exports.default = ProductOptionValue;
//# sourceMappingURL=product-option-value.js.map