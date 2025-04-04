"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const inventory_item_1 = __importDefault(require("./inventory-item"));
const InventoryLevel = utils_1.model
    .define("InventoryLevel", {
    id: utils_1.model.id({ prefix: "ilev" }).primaryKey(),
    location_id: utils_1.model.text(),
    stocked_quantity: utils_1.model.bigNumber().default(0),
    reserved_quantity: utils_1.model.bigNumber().default(0),
    incoming_quantity: utils_1.model.bigNumber().default(0),
    metadata: utils_1.model.json().nullable(),
    inventory_item: utils_1.model.belongsTo(() => inventory_item_1.default, {
        mappedBy: "location_levels",
    }),
    available_quantity: utils_1.model.bigNumber().computed(),
})
    .indexes([
    {
        name: "IDX_inventory_level_inventory_item_id",
        on: ["inventory_item_id"],
        where: "deleted_at IS NULL",
    },
    {
        name: "IDX_inventory_level_location_id",
        on: ["location_id"],
        where: "deleted_at IS NULL",
    },
    {
        name: "IDX_inventory_level_location_id_inventory_item_id",
        on: ["inventory_item_id", "location_id"],
        unique: true,
        where: "deleted_at IS NULL",
    },
]);
exports.default = InventoryLevel;
//# sourceMappingURL=inventory-level.js.map