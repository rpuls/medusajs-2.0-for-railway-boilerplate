"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderSummary = void 0;
const utils_1 = require("@medusajs/framework/utils");
const order_1 = require("./order");
const _OrderSummary = utils_1.model
    .define({
    tableName: "order_summary",
    name: "OrderSummary",
}, {
    id: utils_1.model.id({ prefix: "ordsum" }).primaryKey(),
    version: utils_1.model.number().default(1),
    totals: utils_1.model.json(),
    order: utils_1.model.belongsTo(() => order_1.Order, {
        mappedBy: "summary",
    }),
})
    .indexes([
    {
        name: "IDX_order_summary_order_id_version",
        on: ["order_id", "version"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
    {
        name: "IDX_order_summary_deleted_at",
        on: ["deleted_at"],
        unique: false,
        where: "deleted_at IS NOT NULL",
    },
]);
exports.OrderSummary = _OrderSummary;
//# sourceMappingURL=order-summary.js.map