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
exports.adminProductTagRoutesMiddlewares = void 0;
const QueryConfig = __importStar(require("./query-config"));
const framework_1 = require("@medusajs/framework");
const validators_1 = require("./validators");
exports.adminProductTagRoutesMiddlewares = [
    {
        method: ["GET"],
        matcher: "/admin/product-tags",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetProductTagsParams, QueryConfig.listProductTagsTransformQueryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/admin/product-tags/:id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetProductTagParams, QueryConfig.retrieveProductTagTransformQueryConfig),
        ],
    },
    // Create/update/delete methods are new in v2
    {
        method: ["POST"],
        matcher: "/admin/product-tags",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminCreateProductTag),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetProductTagParams, QueryConfig.retrieveProductTagTransformQueryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/product-tags/:id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminUpdateProductTag),
            (0, framework_1.validateAndTransformQuery)(validators_1.AdminGetProductTagParams, QueryConfig.retrieveProductTagTransformQueryConfig),
        ],
    },
    {
        method: ["DELETE"],
        matcher: "/admin/product-tags/:id",
        middlewares: [],
    },
];
//# sourceMappingURL=middlewares.js.map