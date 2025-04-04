"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const product_1 = __importDefault(require("./product"));
const ProductCategory = utils_1.model
    .define("ProductCategory", {
    id: utils_1.model.id({ prefix: "pcat" }).primaryKey(),
    name: utils_1.model.text().searchable(),
    description: utils_1.model.text().searchable().default(""),
    handle: utils_1.model.text().searchable(),
    mpath: utils_1.model.text(),
    is_active: utils_1.model.boolean().default(false),
    is_internal: utils_1.model.boolean().default(false),
    rank: utils_1.model.number().default(0),
    metadata: utils_1.model.json().nullable(),
    parent_category: utils_1.model
        .belongsTo(() => ProductCategory, {
        mappedBy: "category_children",
    })
        .nullable(),
    category_children: utils_1.model.hasMany(() => ProductCategory, {
        mappedBy: "parent_category",
    }),
    products: utils_1.model.manyToMany(() => product_1.default, {
        mappedBy: "categories",
    }),
})
    .cascades({
    delete: ["category_children"],
})
    .indexes([
    {
        name: "IDX_product_category_path",
        on: ["mpath"],
        unique: false,
        where: "deleted_at IS NULL",
    },
    {
        name: "IDX_category_handle_unique",
        on: ["handle"],
        unique: true,
        where: "deleted_at IS NULL",
    },
]);
exports.default = ProductCategory;
//# sourceMappingURL=product-category.js.map