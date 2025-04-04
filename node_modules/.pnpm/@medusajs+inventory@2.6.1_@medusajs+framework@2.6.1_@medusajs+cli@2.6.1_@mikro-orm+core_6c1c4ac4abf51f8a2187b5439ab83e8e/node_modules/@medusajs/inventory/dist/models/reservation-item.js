"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const inventory_item_1 = __importDefault(require("./inventory-item"));
const ReservationItem = utils_1.model
    .define("ReservationItem", {
    id: utils_1.model.id({ prefix: "resitem" }).primaryKey(),
    line_item_id: utils_1.model.text().nullable(),
    allow_backorder: utils_1.model.boolean().default(false),
    location_id: utils_1.model.text(),
    quantity: utils_1.model.bigNumber(),
    raw_quantity: utils_1.model.json(),
    external_id: utils_1.model.text().nullable(),
    description: utils_1.model.text().searchable().nullable(),
    created_by: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    inventory_item: utils_1.model
        .belongsTo(() => inventory_item_1.default, {
        mappedBy: "reservation_items",
    })
        .searchable(),
})
    .indexes([
    {
        name: "IDX_reservation_item_line_item_id",
        on: ["line_item_id"],
        where: "deleted_at IS NULL",
    },
    {
        name: "IDX_reservation_item_location_id",
        on: ["location_id"],
        where: "deleted_at IS NULL",
    },
    {
        name: "IDX_reservation_item_inventory_item_id",
        on: ["inventory_item_id"],
        where: "deleted_at IS NULL",
    },
]);
exports.default = ReservationItem;
//# sourceMappingURL=reservation-item.js.map