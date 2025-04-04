"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinerConfig = void 0;
const utils_1 = require("@medusajs/framework/utils");
const schema_1 = __importDefault(require("./schema"));
exports.joinerConfig = (0, utils_1.defineJoinerConfig)(utils_1.Modules.INVENTORY, {
    schema: schema_1.default,
    alias: [
        {
            name: ["inventory_items", "inventory_item", "inventory"],
            entity: "InventoryItem",
            args: {
                methodSuffix: "InventoryItems",
            },
        },
        {
            name: [
                "reservation",
                "reservations",
                "reservation_item",
                "reservation_items",
            ],
            entity: "ReservationItem",
            args: {
                methodSuffix: "ReservationItems",
            },
        },
    ],
});
//# sourceMappingURL=joiner-config.js.map