"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const product_category_1 = __importDefault(require("./product-category"));
const product_collection_1 = __importDefault(require("./product-collection"));
const product_image_1 = __importDefault(require("./product-image"));
const product_option_1 = __importDefault(require("./product-option"));
const product_tag_1 = __importDefault(require("./product-tag"));
const product_type_1 = __importDefault(require("./product-type"));
const product_variant_1 = __importDefault(require("./product-variant"));
const Product = utils_1.model
    .define("Product", {
    id: utils_1.model.id({ prefix: "prod" }).primaryKey(),
    title: utils_1.model.text().searchable(),
    handle: utils_1.model.text(),
    subtitle: utils_1.model.text().searchable().nullable(),
    description: utils_1.model.text().searchable().nullable(),
    is_giftcard: utils_1.model.boolean().default(false),
    status: utils_1.model
        .enum(utils_1.ProductUtils.ProductStatus)
        .default(utils_1.ProductUtils.ProductStatus.DRAFT),
    thumbnail: utils_1.model.text().nullable(),
    weight: utils_1.model.text().nullable(),
    length: utils_1.model.text().nullable(),
    height: utils_1.model.text().nullable(),
    width: utils_1.model.text().nullable(),
    origin_country: utils_1.model.text().nullable(),
    hs_code: utils_1.model.text().nullable(),
    mid_code: utils_1.model.text().nullable(),
    material: utils_1.model.text().nullable(),
    discountable: utils_1.model.boolean().default(true),
    external_id: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    variants: utils_1.model.hasMany(() => product_variant_1.default, {
        mappedBy: "product",
    }),
    type: utils_1.model
        .belongsTo(() => product_type_1.default, {
        mappedBy: "products",
    })
        .nullable(),
    tags: utils_1.model.manyToMany(() => product_tag_1.default, {
        mappedBy: "products",
        pivotTable: "product_tags",
    }),
    options: utils_1.model.hasMany(() => product_option_1.default, {
        mappedBy: "product",
    }),
    images: utils_1.model.hasMany(() => product_image_1.default, {
        mappedBy: "product",
    }),
    collection: utils_1.model
        .belongsTo(() => product_collection_1.default, {
        mappedBy: "products",
    })
        .nullable(),
    categories: utils_1.model.manyToMany(() => product_category_1.default, {
        pivotTable: "product_category_product",
        mappedBy: "products",
    }),
})
    .cascades({
    delete: ["variants", "options", "images"],
})
    .indexes([
    {
        name: "IDX_product_handle_unique",
        on: ["handle"],
        unique: true,
        where: "deleted_at IS NULL",
    },
    {
        name: "IDX_product_type_id",
        on: ["type_id"],
        unique: false,
        where: "deleted_at IS NULL",
    },
    {
        name: "IDX_product_collection_id",
        on: ["collection_id"],
        unique: false,
        where: "deleted_at IS NULL",
    },
]);
exports.default = Product;
//# sourceMappingURL=product.js.map