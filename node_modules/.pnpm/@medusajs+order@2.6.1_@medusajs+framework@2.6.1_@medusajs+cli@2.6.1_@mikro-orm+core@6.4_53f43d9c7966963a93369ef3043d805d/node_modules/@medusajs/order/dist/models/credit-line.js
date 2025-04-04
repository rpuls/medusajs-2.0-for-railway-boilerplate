"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderCreditLine = void 0;
const utils_1 = require("@medusajs/framework/utils");
const order_1 = require("./order");
const OrderCreditLine_ = utils_1.model
    .define("OrderCreditLine", {
    id: utils_1.model.id({ prefix: "ordcl" }).primaryKey(),
    order: utils_1.model.belongsTo(() => order_1.Order, {
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
        name: "IDX_order_credit_line_order_id",
        on: ["order_id"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_credit_line_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.OrderCreditLine = OrderCreditLine_;
//# sourceMappingURL=credit-line.js.map