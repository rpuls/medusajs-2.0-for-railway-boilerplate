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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeProductRoutesMiddlewares = void 0;
const framework_1 = require("@medusajs/framework");
const http_1 = require("@medusajs/framework/http");
const utils_1 = require("@medusajs/framework/utils");
const middlewares_1 = require("../../utils/middlewares");
const QueryConfig = __importStar(require("./query-config"));
const validators_1 = require("./validators");
const index_engine_1 = __importDefault(require("../../../loaders/feature-flags/index-engine"));
exports.storeProductRoutesMiddlewares = [
    {
        method: ["GET"],
        matcher: "/store/products",
        middlewares: [
            (0, http_1.authenticate)("customer", ["session", "bearer"], {
                allowUnauthenticated: true,
            }),
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetProductsParams, QueryConfig.listProductQueryConfig),
            (0, middlewares_1.filterByValidSalesChannels)(),
            (req, res, next) => {
                if (framework_1.featureFlagRouter.isFeatureEnabled(index_engine_1.default.key)) {
                    return next();
                }
                return (0, http_1.maybeApplyLinkFilter)({
                    entryPoint: "product_sales_channel",
                    resourceId: "product_id",
                    filterableField: "sales_channel_id",
                })(req, res, next);
            },
            (0, http_1.applyDefaultFilters)({
                status: utils_1.ProductStatus.PUBLISHED,
                // TODO: the type here seems off and the implementation does not take into account $and and $or possible filters. Might be worth re working (original type used here was StoreGetProductsParamsType)
                categories: (filters, fields) => {
                    const categoryIds = filters.category_id;
                    delete filters.category_id;
                    if (!(0, utils_1.isPresent)(categoryIds)) {
                        return;
                    }
                    return { id: categoryIds, is_internal: false, is_active: true };
                },
            }),
            (0, middlewares_1.normalizeDataForContext)(),
            (0, middlewares_1.setPricingContext)(),
            (0, middlewares_1.setTaxContext)(),
            (0, http_1.clearFiltersByKey)(["region_id", "country_code", "province", "cart_id"]),
        ],
    },
    {
        method: ["GET"],
        matcher: "/store/products/:id",
        middlewares: [
            (0, http_1.authenticate)("customer", ["session", "bearer"], {
                allowUnauthenticated: true,
            }),
            (0, framework_1.validateAndTransformQuery)(validators_1.StoreGetProductsParams, QueryConfig.retrieveProductQueryConfig),
            (0, http_1.applyParamsAsFilters)({ id: "id" }),
            (0, middlewares_1.filterByValidSalesChannels)(),
            (0, http_1.maybeApplyLinkFilter)({
                entryPoint: "product_sales_channel",
                resourceId: "product_id",
                filterableField: "sales_channel_id",
            }),
            (0, http_1.applyDefaultFilters)({
                status: utils_1.ProductStatus.PUBLISHED,
                categories: (_filters, fields) => {
                    if (!fields.some((field) => field.startsWith("categories"))) {
                        return;
                    }
                    return { is_internal: false, is_active: true };
                },
            }),
            (0, middlewares_1.normalizeDataForContext)(),
            (0, middlewares_1.setPricingContext)(),
            (0, middlewares_1.setTaxContext)(),
            (0, http_1.clearFiltersByKey)(["region_id", "country_code", "province", "cart_id"]),
        ],
    },
];
//# sourceMappingURL=middlewares.js.map