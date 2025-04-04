"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const tax_rate_rule_1 = __importDefault(require("./tax-rate-rule"));
const tax_region_1 = __importDefault(require("./tax-region"));
const TaxRate = utils_1.model
    .define("TaxRate", {
    id: utils_1.model.id({ prefix: "txr" }).primaryKey(),
    rate: utils_1.model.float().nullable(),
    code: utils_1.model.text().searchable(),
    name: utils_1.model.text().searchable(),
    is_default: utils_1.model.boolean().default(false),
    is_combinable: utils_1.model.boolean().default(false),
    tax_region: utils_1.model.belongsTo(() => tax_region_1.default, {
        mappedBy: "tax_rates",
    }),
    rules: utils_1.model.hasMany(() => tax_rate_rule_1.default, {
        mappedBy: "tax_rate",
    }),
    metadata: utils_1.model.json().nullable(),
    created_by: utils_1.model.text().nullable(),
})
    .indexes([
    {
        name: "IDX_tax_rate_tax_region_id",
        on: ["tax_region_id"],
        where: "deleted_at IS NULL",
    },
    {
        name: "IDX_single_default_region",
        on: ["tax_region_id"],
        unique: true,
        where: "is_default = true AND deleted_at IS NULL",
    },
])
    .cascades({
    delete: ["rules"],
});
exports.default = TaxRate;
//# sourceMappingURL=tax-rate.js.map