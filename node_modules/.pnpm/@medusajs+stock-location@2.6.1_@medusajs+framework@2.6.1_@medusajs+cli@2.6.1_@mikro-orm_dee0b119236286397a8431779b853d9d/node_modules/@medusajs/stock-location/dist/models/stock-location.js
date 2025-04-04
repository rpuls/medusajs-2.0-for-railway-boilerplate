"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const stock_location_address_1 = __importDefault(require("./stock-location-address"));
const StockLocation = utils_1.model.define("StockLocation", {
    id: utils_1.model.id({ prefix: "sloc" }).primaryKey(),
    name: utils_1.model.text().searchable(),
    metadata: utils_1.model.json().nullable(),
    address: utils_1.model
        .belongsTo(() => stock_location_address_1.default, {
        mappedBy: "stock_locations",
    })
        .nullable(),
});
exports.default = StockLocation;
//# sourceMappingURL=stock-location.js.map