"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinerConfig = void 0;
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("./models");
const schema_1 = __importDefault(require("./schema"));
exports.joinerConfig = (0, utils_1.defineJoinerConfig)(utils_1.Modules.ORDER, {
    schema: schema_1.default,
    linkableKeys: {
        claim_id: "OrderClaim",
        exchange_id: "OrderExchange",
    },
    models: [
        _models_1.Order,
        _models_1.OrderAddress,
        _models_1.OrderChange,
        _models_1.OrderClaim,
        _models_1.OrderExchange,
        _models_1.OrderItem,
        _models_1.OrderLineItem,
        _models_1.OrderShippingMethod,
        _models_1.OrderTransaction,
        _models_1.Return,
        _models_1.ReturnReason,
    ],
});
//# sourceMappingURL=joiner-config.js.map