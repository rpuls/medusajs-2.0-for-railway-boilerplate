"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const product_1 = __importDefault(require("./product"));
const ProductTag = utils_1.model
    .define({ tableName: "product_tag", name: "ProductTag" }, {
    id: utils_1.model.id({ prefix: "ptag" }).primaryKey(),
    value: utils_1.model.text().searchable(),
    metadata: utils_1.model.json().nullable(),
    products: utils_1.model.manyToMany(() => product_1.default, {
        mappedBy: "tags",
    }),
})
    .indexes([
    {
        name: "IDX_tag_value_unique",
        on: ["value"],
        unique: true,
        where: "deleted_at IS NULL",
    },
]);
exports.default = ProductTag;
//# sourceMappingURL=product-tag.js.map