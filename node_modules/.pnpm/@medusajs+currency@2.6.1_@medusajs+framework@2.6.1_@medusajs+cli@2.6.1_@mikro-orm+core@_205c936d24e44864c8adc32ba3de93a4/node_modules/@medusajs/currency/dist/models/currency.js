"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
exports.default = utils_1.model.define("currency", {
    code: utils_1.model.text().searchable().primaryKey(),
    symbol: utils_1.model.text(),
    symbol_native: utils_1.model.text(),
    name: utils_1.model.text().searchable(),
    decimal_digits: utils_1.model.number().default(0),
    rounding: utils_1.model.bigNumber().default(0),
});
//# sourceMappingURL=currency.js.map