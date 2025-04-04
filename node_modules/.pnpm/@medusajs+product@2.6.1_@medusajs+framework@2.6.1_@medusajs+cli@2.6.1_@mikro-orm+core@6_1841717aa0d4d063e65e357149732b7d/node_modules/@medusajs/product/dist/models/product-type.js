"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require(".");
const ProductType = utils_1.model
    .define("ProductType", {
    id: utils_1.model.id({ prefix: "ptyp" }).primaryKey(),
    value: utils_1.model.text().searchable(),
    metadata: utils_1.model.json().nullable(),
    products: utils_1.model.hasMany(() => _models_1.Product, {
        mappedBy: "type",
    }),
})
    .indexes([
    {
        name: "IDX_type_value_unique",
        on: ["value"],
        unique: true,
        where: "deleted_at IS NULL",
    },
]);
exports.default = ProductType;
//# sourceMappingURL=product-type.js.map