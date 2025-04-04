"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const country_1 = __importDefault(require("./country"));
exports.default = utils_1.model.define("region", {
    id: utils_1.model.id({ prefix: "reg" }).primaryKey(),
    name: utils_1.model.text().searchable(),
    currency_code: utils_1.model.text().searchable(),
    automatic_taxes: utils_1.model.boolean().default(true),
    countries: utils_1.model.hasMany(() => country_1.default),
    metadata: utils_1.model.json().nullable(),
});
//# sourceMappingURL=region.js.map