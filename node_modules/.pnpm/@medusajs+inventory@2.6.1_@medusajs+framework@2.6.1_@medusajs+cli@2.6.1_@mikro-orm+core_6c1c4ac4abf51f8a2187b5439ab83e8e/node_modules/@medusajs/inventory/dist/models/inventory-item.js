"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const inventory_level_1 = __importDefault(require("./inventory-level"));
const reservation_item_1 = __importDefault(require("./reservation-item"));
const InventoryItem = utils_1.model
    .define("InventoryItem", {
    id: utils_1.model.id({ prefix: "iitem" }).primaryKey(),
    sku: utils_1.model.text().searchable().nullable(),
    origin_country: utils_1.model.text().nullable(),
    hs_code: utils_1.model.text().searchable().nullable(),
    mid_code: utils_1.model.text().searchable().nullable(),
    material: utils_1.model.text().nullable(),
    weight: utils_1.model.number().nullable(),
    length: utils_1.model.number().nullable(),
    height: utils_1.model.number().nullable(),
    width: utils_1.model.number().nullable(),
    requires_shipping: utils_1.model.boolean().default(true),
    description: utils_1.model.text().searchable().nullable(),
    title: utils_1.model.text().searchable().nullable(),
    thumbnail: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    location_levels: utils_1.model.hasMany(() => inventory_level_1.default, {
        mappedBy: "inventory_item",
    }),
    reservation_items: utils_1.model.hasMany(() => reservation_item_1.default, {
        mappedBy: "inventory_item",
    }),
    reserved_quantity: utils_1.model.number().computed(),
    stocked_quantity: utils_1.model.number().computed(),
})
    .cascades({
    delete: ["location_levels", "reservation_items"],
})
    .indexes([
    {
        name: "IDX_inventory_item_sku",
        on: ["sku"],
        unique: true,
        where: "deleted_at IS NULL",
    },
]);
exports.default = InventoryItem;
//# sourceMappingURL=inventory-item.js.map