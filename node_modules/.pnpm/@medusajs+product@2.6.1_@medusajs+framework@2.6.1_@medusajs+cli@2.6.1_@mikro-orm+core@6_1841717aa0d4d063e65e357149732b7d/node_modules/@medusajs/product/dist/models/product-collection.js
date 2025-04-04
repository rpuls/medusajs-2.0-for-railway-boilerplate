"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const product_1 = __importDefault(require("./product"));
const ProductCollection = utils_1.model
    .define("ProductCollection", {
    id: utils_1.model.id({ prefix: "pcol" }).primaryKey(),
    title: utils_1.model.text().searchable(),
    handle: utils_1.model.text(),
    metadata: utils_1.model.json().nullable(),
    products: utils_1.model.hasMany(() => product_1.default, {
        mappedBy: "collection",
    }),
})
    .indexes([
    {
        name: "IDX_collection_handle_unique",
        on: ["handle"],
        unique: true,
        where: "deleted_at IS NULL",
    },
]);
exports.default = ProductCollection;
//# sourceMappingURL=product-collection.js.map