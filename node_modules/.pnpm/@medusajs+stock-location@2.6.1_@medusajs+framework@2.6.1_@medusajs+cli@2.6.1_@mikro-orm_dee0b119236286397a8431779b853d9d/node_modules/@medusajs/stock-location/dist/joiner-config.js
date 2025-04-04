"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinerConfig = void 0;
const utils_1 = require("@medusajs/framework/utils");
const models_1 = require("./models");
const schema_1 = __importDefault(require("./schema"));
exports.joinerConfig = (0, utils_1.defineJoinerConfig)(utils_1.Modules.STOCK_LOCATION, {
    schema: schema_1.default,
    linkableKeys: {
        stock_location_id: models_1.StockLocation.name,
        location_id: models_1.StockLocation.name,
    },
});
//# sourceMappingURL=joiner-config.js.map