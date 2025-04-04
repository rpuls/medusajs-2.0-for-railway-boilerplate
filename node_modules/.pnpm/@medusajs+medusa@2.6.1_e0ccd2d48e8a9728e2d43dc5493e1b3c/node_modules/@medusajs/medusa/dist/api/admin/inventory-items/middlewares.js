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
exports.adminInventoryRoutesMiddlewares = void 0;
const framework_1 = require("@medusajs/framework");
const middlewares_1 = require("../../../utils/middlewares");
const QueryConfig = __importStar(require("./query-config"));
const validators_1 = require("./validators");
exports.adminInventoryRoutesMiddlewares = [
    {
        method: ["GET"],
        matcher: "/admin/inventory-items",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetInventoryItemsParams, QueryConfig.listTransformQueryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/admin/inventory-items/:id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetInventoryItemParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/inventory-items",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminCreateInventoryItem),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetInventoryItemParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/inventory-items/batch",
        bodyParser: {
            sizeLimit: middlewares_1.DEFAULT_BATCH_ENDPOINTS_SIZE_LIMIT,
        },
        middlewares: [(0, framework_1.validateAndTransformBody)(validators_1.AdminBatchInventoryItemLevels)],
    },
    {
        method: ["POST"],
        matcher: "/admin/inventory-items/location-levels/batch",
        bodyParser: {
            sizeLimit: middlewares_1.DEFAULT_BATCH_ENDPOINTS_SIZE_LIMIT,
        },
        middlewares: [(0, framework_1.validateAndTransformBody)(validators_1.AdminBatchInventoryItemLevels)],
    },
    {
        method: ["POST"],
        matcher: "/admin/inventory-items/:id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminUpdateInventoryItem),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetInventoryItemParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/admin/inventory-items/:id/location-levels",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetInventoryLocationLevelsParams, QueryConfig.listLocationLevelsTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/inventory-items/:id/location-levels",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminCreateInventoryLocationLevel),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetInventoryItemParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/inventory-items/:id/location-levels/batch",
        bodyParser: {
            sizeLimit: middlewares_1.DEFAULT_BATCH_ENDPOINTS_SIZE_LIMIT,
        },
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminBatchInventoryItemLocationsLevel),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetInventoryLocationLevelParams, QueryConfig.retrieveLocationLevelsTransformQueryConfig),
        ],
    },
    {
        method: ["DELETE"],
        matcher: "/admin/inventory-items/:id/location-levels/:location_id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetInventoryItemParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/inventory-items/:id/location-levels/:location_id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminUpdateInventoryLocationLevel),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetInventoryItemParams, QueryConfig.retrieveTransformQueryConfig),
        ],
    },
];
//# sourceMappingURL=middlewares.js.map