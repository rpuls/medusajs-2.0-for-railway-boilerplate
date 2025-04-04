"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingEvents = void 0;
const event_bus_1 = require("../event-bus");
const modules_sdk_1 = require("../modules-sdk");
const eventBaseNames = ["priceListRule", "priceList", "priceRule", "priceSet", "price"];
exports.PricingEvents = (0, event_bus_1.buildEventNamesFromEntityName)(eventBaseNames, modules_sdk_1.Modules.PRICING);
//# sourceMappingURL=events.js.map