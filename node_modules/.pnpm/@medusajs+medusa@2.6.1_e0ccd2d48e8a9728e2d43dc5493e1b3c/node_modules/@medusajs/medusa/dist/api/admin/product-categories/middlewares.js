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
exports.adminProductCategoryRoutesMiddlewares = void 0;
const framework_1 = require("@medusajs/framework");
const validators_1 = require("../../utils/validators");
const QueryConfig = __importStar(require("./query-config"));
const validators_2 = require("./validators");
exports.adminProductCategoryRoutesMiddlewares = [
    {
        method: ["GET"],
        matcher: "/admin/product-categories",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminProductCategoriesParams, QueryConfig.listProductCategoryConfig),
        ],
    },
    {
        method: ["GET"],
        matcher: "/admin/product-categories/:id",
        middlewares: [
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminProductCategoryParams, QueryConfig.retrieveProductCategoryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/product-categories",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.AdminCreateProductCategory),
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminProductCategoryParams, QueryConfig.retrieveProductCategoryConfig),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/product-categories/:id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_2.AdminUpdateProductCategory),
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminProductCategoryParams, QueryConfig.retrieveProductCategoryConfig),
        ],
    },
    {
        method: ["DELETE"],
        matcher: "/admin/product-categories/:id",
        middlewares: [],
    },
    {
        method: ["POST"],
        matcher: "/admin/product-categories/:id/products",
        middlewares: [
            (0, framework_1.validateAndTransformBody)((0, validators_1.createLinkBody)()),
            (0, framework_1.validateAndTransformQuery)(validators_2.AdminProductCategoryParams, QueryConfig.retrieveProductCategoryConfig),
        ],
    },
];
//# sourceMappingURL=middlewares.js.map