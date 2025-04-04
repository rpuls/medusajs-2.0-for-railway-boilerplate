"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const tax_rate_1 = __importDefault(require("./tax-rate"));
const TaxRateRule = utils_1.model
    .define("TaxRateRule", {
    id: utils_1.model.id({ prefix: "txrule" }).primaryKey(),
    metadata: utils_1.model.json().nullable(),
    created_by: utils_1.model.text().nullable(),
    tax_rate: utils_1.model.belongsTo(() => tax_rate_1.default, {
        mappedBy: "rules",
    }),
    reference: utils_1.model.text(),
    reference_id: utils_1.model.text(),
})
    .indexes([
    {
        name: "IDX_tax_rate_rule_reference_id",
        on: ["reference_id"],
        where: "deleted_at IS NULL",
    },
    {
        name: "IDX_tax_rate_rule_unique_rate_reference",
        on: ["tax_rate_id", "reference_id"],
        unique: true,
        where: "deleted_at IS NULL",
    },
]);
exports.default = TaxRateRule;
//# sourceMappingURL=tax-rate-rule.js.map