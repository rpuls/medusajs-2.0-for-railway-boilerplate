"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryEvents = void 0;
const event_bus_1 = require("../event-bus");
const modules_sdk_1 = require("../modules-sdk");
const eventBaseNames = [
    "inventoryItem",
    "reservationItem",
    "inventoryLevel",
];
exports.InventoryEvents = (0, event_bus_1.buildEventNamesFromEntityName)(eventBaseNames, modules_sdk_1.Modules.INVENTORY);
//# sourceMappingURL=events.js.map