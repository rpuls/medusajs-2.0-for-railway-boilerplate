"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const price_1 = __importDefault(require("./price"));
const PriceSet = utils_1.model
    .define("PriceSet", {
    id: utils_1.model.id({ prefix: "pset" }).primaryKey(),
    prices: utils_1.model.hasMany(() => price_1.default, {
        mappedBy: "price_set",
    }),
})
    .cascades({
    delete: ["prices"],
});
exports.default = PriceSet;
//# sourceMappingURL=price-set.js.map