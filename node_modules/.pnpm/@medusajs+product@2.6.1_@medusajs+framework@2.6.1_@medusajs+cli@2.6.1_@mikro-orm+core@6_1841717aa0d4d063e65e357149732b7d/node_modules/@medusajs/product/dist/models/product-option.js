"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const index_1 = require("./index");
const product_option_value_1 = __importDefault(require("./product-option-value"));
const ProductOption = utils_1.model
    .define("ProductOption", {
    id: utils_1.model.id({ prefix: "opt" }).primaryKey(),
    title: utils_1.model.text().searchable(),
    metadata: utils_1.model.json().nullable(),
    product: utils_1.model.belongsTo(() => index_1.Product, {
        mappedBy: "options",
    }),
    values: utils_1.model.hasMany(() => product_option_value_1.default, {
        mappedBy: "option",
    }),
})
    .cascades({
    delete: ["values"],
})
    .indexes([
    {
        name: "IDX_option_product_id_title_unique",
        on: ["product_id", "title"],
        unique: true,
        where: "deleted_at IS NULL",
    },
]);
exports.default = ProductOption;
//# sourceMappingURL=product-option.js.map