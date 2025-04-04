"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const payment_collection_1 = __importDefault(require("./payment-collection"));
const PaymentProvider = utils_1.model.define("PaymentProvider", {
    id: utils_1.model.id().primaryKey(),
    is_enabled: utils_1.model.boolean().default(true),
    payment_collections: utils_1.model.manyToMany(() => payment_collection_1.default, {
        mappedBy: "payment_providers",
    }),
});
exports.default = PaymentProvider;
//# sourceMappingURL=payment-provider.js.map