"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const cart_1 = __importDefault(require("./cart"));
const CreditLine = utils_1.model
    .define("CreditLine", {
    id: utils_1.model.id({ prefix: "cacl" }).primaryKey(),
    cart: utils_1.model.belongsTo(() => cart_1.default, {
        mappedBy: "credit_lines",
    }),
    reference: utils_1.model.text().nullable(),
    reference_id: utils_1.model.text().nullable(),
    amount: utils_1.model.bigNumber(),
    raw_amount: utils_1.model.json(),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        name: "IDX_cart_credit_line_reference_reference_id",
        on: ["reference", "reference_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.default = CreditLine;
//# sourceMappingURL=credit-line.js.map