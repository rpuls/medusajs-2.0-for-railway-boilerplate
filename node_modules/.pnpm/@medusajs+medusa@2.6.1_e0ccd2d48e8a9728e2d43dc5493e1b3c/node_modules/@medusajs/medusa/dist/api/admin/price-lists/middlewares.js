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
exports.adminPriceListsRoutesMiddlewares = void 0;
const framework_1 = require("@medusajs/framework");
const middlewares_1 = require("../../../utils/middlewares");
const validators_1 = require("../../utils/validators");
const QueryConfig = __importStar(require("./query-config"));
const validators_2 = require("./validators");
exports.adminPriceListsRoutesMiddlewares = [
    {
        method: ["GET"],
        matcher: "/admin/price-lists",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminGetPriceListsParams, QueryConfig.listPriceListQueryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/admin/price-lists/:id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminGetPriceListParams, QueryConfig.retrivePriceListQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/price-lists",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.AdminCreatePriceList),
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminGetPriceListPricesParams, QueryConfig.retrivePriceListQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/price-lists/:id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.AdminUpdatePriceList),
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminGetPriceListPricesParams, QueryConfig.retrivePriceListQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/price-lists/:id/products",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.AdminRemoveProductsPriceList),
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminGetPriceListParams, QueryConfig.listPriceListQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/price-lists/:id/prices/batch",
        bodyParser: {
            sizeLimit: middlewares_1.DEFAULT_BATCH_ENDPOINTS_SIZE_LIMIT,
        },
        middlewares: [
            (0, framework_1.validateAndTransformBody)((0, validators_1.createBatchBody)(validators_2.AdminCreatePriceListPrice, validators_2.AdminUpdatePriceListPrice)),
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminGetPriceListPricesParams, QueryConfig.listPriceListPriceQueryConfig),
        ],
    },
];
//# sourceMappingURL=middlewares.js.map