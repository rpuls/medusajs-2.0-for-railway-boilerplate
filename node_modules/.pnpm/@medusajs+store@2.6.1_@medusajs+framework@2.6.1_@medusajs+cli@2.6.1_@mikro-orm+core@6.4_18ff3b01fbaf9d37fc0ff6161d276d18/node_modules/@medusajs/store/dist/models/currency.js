"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const store_1 = __importDefault(require("./store"));
const StoreCurrency = utils_1.model.define("StoreCurrency", {
    id: utils_1.model.id({ prefix: "stocur" }).primaryKey(),
    currency_code: utils_1.model.text().searchable(),
    is_default: utils_1.model.boolean().default(false),
    store: utils_1.model
        .belongsTo(() => store_1.default, {
        mappedBy: "supported_currencies",
    })
        .nullable(),
});
exports.default = StoreCurrency;
//# sourceMappingURL=currency.js.map