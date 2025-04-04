"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const price_list_1 = __importDefault(require("./price-list"));
const price_rule_1 = __importDefault(require("./price-rule"));
const price_set_1 = __importDefault(require("./price-set"));
const Price = utils_1.model
    .define("Price", {
    id: utils_1.model.id({ prefix: "price" }).primaryKey(),
    title: utils_1.model.text().nullable(),
    currency_code: utils_1.model.text(),
    amount: utils_1.model.bigNumber(),
    min_quantity: utils_1.model.number().nullable(),
    max_quantity: utils_1.model.number().nullable(),
    rules_count: utils_1.model.number().default(0).nullable(),
    price_set: utils_1.model.belongsTo(() => price_set_1.default, {
        mappedBy: "prices",
    }),
    price_rules: utils_1.model.hasMany(() => price_rule_1.default, {
        mappedBy: "price",
    }),
    price_list: utils_1.model
        .belongsTo(() => price_list_1.default, {
        mappedBy: "prices",
    })
        .nullable(),
})
    .cascades({
    delete: ["price_rules"],
})
    .indexes([
    {
        on: ["price_set_id"],
        where: "deleted_at IS NULL",
    },
    {
        on: ["price_list_id"],
        where: "deleted_at IS NULL",
    },
    {
        on: ["currency_code"],
        where: "deleted_at IS NULL",
    },
]);
exports.default = Price;
//# sourceMappingURL=price.js.map