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
exports.storeOrderRoutesMiddlewares = void 0;
const framework_1 = require("@medusajs/framework");
const http_1 = require("@medusajs/framework/http");
const authenticate_middleware_1 = require("../../../utils/middlewares/authenticate-middleware");
const QueryConfig = __importStar(require("./query-config"));
const validators_1 = require("./validators");
exports.storeOrderRoutesMiddlewares = [
    {
        method: ["GET"],
        matcher: "/store/orders",
        middlewares: [
            (0, authenticate_middleware_1.authenticate)("customer", ["session", "bearer"]),
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetOrdersParams, QueryConfig.listTransformQueryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/store/orders/:id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetOrderParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/orders/:id/transfer/request",
        middlewares: [
            (0, authenticate_middleware_1.authenticate)("customer", ["session", "bearer"]),
            (0, http_1.validateAndTransformBody)(validators_1.StoreRequestOrderTransfer),
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetOrderParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/orders/:id/transfer/cancel",
        middlewares: [
            (0, authenticate_middleware_1.authenticate)("customer", ["session", "bearer"]),
            (0, http_1.validateAndTransformBody)(validators_1.StoreCancelOrderTransferRequest),
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetOrderParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/orders/:id/transfer/accept",
        middlewares: [
            (0, http_1.validateAndTransformBody)(validators_1.StoreAcceptOrderTransfer),
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetOrderParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/orders/:id/transfer/decline",
        middlewares: [
            (0, http_1.validateAndTransformBody)(validators_1.StoreDeclineOrderTransferRequest),
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetOrderParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
];
//# sourceMappingURL=middlewares.js.map