"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const http_1 = require("@medusajs/framework/http");
const helpers_1 = require("./helpers");
const index_engine_1 = __importDefault(require("../../../loaders/feature-flags/index-engine"));
const framework_1 = require("@medusajs/framework");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    if (framework_1.featureFlagRouter.isFeatureEnabled(index_engine_1.default.key)) {
        // TODO: These filters are not supported by the index engine yet
        if ((0, utils_1.isPresent)(req.filterableFields.tags) ||
            (0, utils_1.isPresent)(req.filterableFields.categories)) {
            return await getProducts(req, res);
        }
        return await getProductsWithIndexEngine(req, res);
    }
    return await getProducts(req, res);
};
exports.GET = GET;
async function getProducts(req, res) {
    const selectFields = (0, helpers_1.remapKeysForProduct)(req.queryConfig.fields ?? []);
    const { rows: products, metadata } = await (0, http_1.refetchEntities)("product", req.filterableFields, req.scope, selectFields, req.queryConfig.pagination);
    res.json({
        products: products.map(helpers_1.remapProductResponse),
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
}
async function getProductsWithIndexEngine(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: products, metadata } = await query.index({
        entity: "product",
        fields: req.queryConfig.fields ?? [],
        filters: req.filterableFields,
        pagination: req.queryConfig.pagination,
    });
    res.json({
        products: products.map(helpers_1.remapProductResponse),
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
}
const POST = async (req, res) => {
    const { additional_data, ...products } = req.validatedBody;
    const { result } = await (0, core_flows_1.createProductsWorkflow)(req.scope).run({
        input: { products: [products], additional_data },
    });
    const product = await (0, http_1.refetchEntity)("product", result[0].id, req.scope, (0, helpers_1.remapKeysForProduct)(req.queryConfig.fields ?? []));
    res.status(200).json({ product: (0, helpers_1.remapProductResponse)(product) });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map