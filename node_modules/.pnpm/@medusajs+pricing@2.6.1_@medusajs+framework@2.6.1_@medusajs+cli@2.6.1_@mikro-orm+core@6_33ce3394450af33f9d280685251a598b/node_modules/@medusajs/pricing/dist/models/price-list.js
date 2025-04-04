"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const price_1 = __importDefault(require("./price"));
const price_list_rule_1 = __importDefault(require("./price-list-rule"));
const PriceList = utils_1.model
    .define("PriceList", {
    id: utils_1.model.id({ prefix: "plist" }).primaryKey(),
    title: utils_1.model.text().searchable(),
    description: utils_1.model.text().searchable(),
    status: utils_1.model.enum(utils_1.PriceListStatus).default(utils_1.PriceListStatus.DRAFT),
    type: utils_1.model.enum(utils_1.PriceListType).default(utils_1.PriceListType.SALE),
    starts_at: utils_1.model.dateTime().nullable(),
    ends_at: utils_1.model.dateTime().nullable(),
    rules_count: utils_1.model.number().default(0).nullable(),
    prices: utils_1.model.hasMany(() => price_1.default, {
        mappedBy: "price_list",
    }),
    price_list_rules: utils_1.model.hasMany(() => price_list_rule_1.default, {
        mappedBy: "price_list",
    }),
})
    .cascades({
    delete: ["price_list_rules", "prices"],
});
exports.default = PriceList;
//# sourceMappingURL=price-list.js.map