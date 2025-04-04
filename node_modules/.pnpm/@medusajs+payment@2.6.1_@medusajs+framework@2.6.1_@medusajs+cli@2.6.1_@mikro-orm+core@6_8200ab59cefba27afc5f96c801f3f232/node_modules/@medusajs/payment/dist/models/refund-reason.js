"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const refund_1 = __importDefault(require("./refund"));
const RefundReason = utils_1.model.define("RefundReason", {
    id: utils_1.model.id({ prefix: "refr" }).primaryKey(),
    label: utils_1.model.text().searchable(),
    description: utils_1.model.text().nullable(),
    metadata: utils_1.model.json().nullable(),
    refunds: utils_1.model.hasMany(() => refund_1.default, {
        mappedBy: "refund_reason",
    }),
});
exports.default = RefundReason;
//# sourceMappingURL=refund-reason.js.map