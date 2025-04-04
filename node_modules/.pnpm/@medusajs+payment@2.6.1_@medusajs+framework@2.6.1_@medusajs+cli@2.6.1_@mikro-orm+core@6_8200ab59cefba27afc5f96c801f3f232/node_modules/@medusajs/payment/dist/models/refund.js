"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const payment_1 = __importDefault(require("./payment"));
const refund_reason_1 = __importDefault(require("./refund-reason"));
const Refund = utils_1.model
    .define("Refund", {
    id: utils_1.model.id({ prefix: "ref" }).primaryKey(),
    amount: utils_1.model.bigNumber(),
    payment: utils_1.model.belongsTo(() => payment_1.default, {
        mappedBy: "refunds",
    }),
    refund_reason: utils_1.model
        .belongsTo(() => refund_reason_1.default, {
        mappedBy: "refunds",
    })
        .nullable(),
    note: utils_1.model.text().nullable(),
    created_by: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        name: "IDX_refund_payment_id",
        on: ["payment_id"],
    },
]);
exports.default = Refund;
//# sourceMappingURL=refund.js.map