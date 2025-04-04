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
exports.storeCustomerRoutesMiddlewares = void 0;
const QueryConfig = __importStar(require("./query-config"));
const validators_1 = require("./validators");
const authenticate_middleware_1 = require("../../../utils/middlewares/authenticate-middleware");
const framework_1 = require("@medusajs/framework");
exports.storeCustomerRoutesMiddlewares = [
    {
        method: ["POST"],
        matcher: "/store/customers",
        middlewares: [
            (0, authenticate_middleware_1.authenticate)("customer", ["session", "bearer"], {
                allowUnregistered: true,
            }),
            (0, framework_1.validateAndTransformBody)(validators_1.StoreCreateCustomer),
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetCustomerParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: "ALL",
        matcher: "/store/customers/me*",
        middlewares: [(0, authenticate_middleware_1.authenticate)("customer", ["session", "bearer"])],
    },
    {
        method: ["GET"],
        matcher: "/store/customers/me",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetCustomerParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/customers/me",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.StoreUpdateCustomer),
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetCustomerParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/store/customers/me/addresses",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetCustomerAddressesParams, QueryConfig.listAddressesTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/customers/me/addresses",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.StoreCreateCustomerAddress),
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetCustomerParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/store/customers/me/addresses/:address_id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetCustomerAddressParams, QueryConfig.retrieveAddressTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/store/customers/me/addresses/:address_id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.StoreUpdateCustomerAddress),
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetCustomerParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["DELETE"],
        matcher: "/store/customers/me/addresses/:address_id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetCustomerAddressParams, QueryConfig.retrieveAddressTransformQueryConfig),
        ],
    },
];
//# sourceMappingURL=middlewares.js.map