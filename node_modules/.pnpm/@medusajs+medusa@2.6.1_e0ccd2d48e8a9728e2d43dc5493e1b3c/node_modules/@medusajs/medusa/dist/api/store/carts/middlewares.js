"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeCartRoutesMiddlewares = void 0;
const framework_1 = require("@medusajs/framework");
const http_1 = require("@medusajs/framework/http");
const ensure_pub_key_sales_channel_match_1 = require("../../utils/middlewares/common/ensure-pub-key-sales-channel-match");
const maybe_attach_pub_key_scopes_1 = require("../../utils/middlewares/common/maybe-attach-pub-key-scopes");
const OrderQueryConfig = __importStar(require("../orders/query-config"));
const validators_1 = require("../orders/validators");
const QueryConfig = __importStar(require("./query-config"));
const validators_2 = require("./validators");
exports.storeCartRoutesMiddlewares = [
    {
        method: ["GET"],
        matcher: "/store/carts/:id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_2.StoreGetCartsCart, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/carts",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.StoreCreateCart),
            (0, framework_1.validateAndTransformQuery)(validators_2.StoreGetCartsCart, QueryConfig.retrieveTransformQueryConfig),
            maybe_attach_pub_key_scopes_1.maybeAttachPublishableKeyScopes,
            ensure_pub_key_sales_channel_match_1.ensurePublishableKeyAndSalesChannelMatch,
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/carts/:id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.StoreUpdateCart),
            (0, framework_1.validateAndTransformQuery)(validators_2.StoreGetCartsCart, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/carts/:id/customer",
        middlewares: [
            (0, http_1.authenticate)("customer", ["session", "bearer"]),
            (0, framework_1.validateAndTransformBody)(validators_2.StoreUpdateCartCustomer),
            (0, framework_1.validateAndTransformQuery)(validators_2.StoreGetCartsCart, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/carts/:id/line-items",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.StoreAddCartLineItem),
            (0, framework_1.validateAndTransformQuery)(validators_2.StoreGetCartsCart, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/carts/:id/line-items/:line_id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.StoreUpdateCartLineItem),
            (0, framework_1.validateAndTransformQuery)(validators_2.StoreGetCartsCart, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["DELETE"],
        matcher: "/store/carts/:id/line-items/:line_id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_2.StoreGetCartsCart, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/carts/:id/promotions",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.StoreAddCartPromotions),
            (0, framework_1.validateAndTransformQuery)(validators_2.StoreGetCartsCart, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/carts/:id/taxes",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.StoreCalculateCartTaxes),
            (0, framework_1.validateAndTransformQuery)(validators_2.StoreGetCartsCart, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/carts/:id/shipping-methods",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.StoreAddCartShippingMethods),
            (0, framework_1.validateAndTransformQuery)(validators_2.StoreGetCartsCart, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["DELETE"],
        matcher: "/store/carts/:id/promotions",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.StoreRemoveCartPromotions),
            (0, framework_1.validateAndTransformQuery)(validators_2.StoreGetCartsCart, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/carts/:id/complete",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetOrderParams, OrderQueryConfig.retrieveTransformQueryConfig),
        ],
    },
];
//# sourceMappingURL=middlewares.js.map