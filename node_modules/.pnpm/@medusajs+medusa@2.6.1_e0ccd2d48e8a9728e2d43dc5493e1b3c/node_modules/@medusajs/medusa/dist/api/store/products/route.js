"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const framework_1 = require("@medusajs/framework");
const utils_1 = require("@medusajs/framework/utils");
const index_engine_1 = __importDefault(require("../../../loaders/feature-flags/index-engine"));
const middlewares_1 = require("../../utils/middlewares");
const helpers_1 = require("./helpers");
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
async function getProductsWithIndexEngine(req, res) {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const context = {};
    const withInventoryQuantity = req.queryConfig.fields.some((field) => field.includes("variants.inventory_quantity"));
    if (withInventoryQuantity) {
        req.queryConfig.fields = req.queryConfig.fields.filter((field) => !field.includes("variants.inventory_quantity"));
    }
    if ((0, utils_1.isPresent)(req.pricingContext)) {
        context["variants"] ??= {};
        context["variants"]["calculated_price"] = (0, utils_1.QueryContext)(req.pricingContext);
    }
    const filters = req.filterableFields;
    if ((0, utils_1.isPresent)(filters.sales_channel_id)) {
        const salesChannelIds = filters.sales_channel_id;
        filters["sales_channels"] ??= {};
        filters["sales_channels"]["id"] = salesChannelIds;
        delete filters.sales_channel_id;
    }
    const { data: products = [], metadata } = await query.index({
        entity: "product",
        fields: req.queryConfig.fields,
        filters,
        pagination: req.queryConfig.pagination,
        context,
    });
    if (withInventoryQuantity) {
        await (0, middlewares_1.wrapVariantsWithInventoryQuantityForSalesChannel)(req, products.map((product) => product.variants).flat(1));
    }
    await (0, helpers_1.wrapProductsWithTaxPrices)(req, products);
    res.json({
        products,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
}
async function getProducts(req, res) {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const context = {};
    const withInventoryQuantity = req.queryConfig.fields.some((field) => field.includes("variants.inventory_quantity"));
    if (withInventoryQuantity) {
        req.queryConfig.fields = req.queryConfig.fields.filter((field) => !field.includes("variants.inventory_quantity"));
    }
    if ((0, utils_1.isPresent)(req.pricingContext)) {
        context["variants.calculated_price"] = {
            context: req.pricingContext,
        };
    }
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "product",
        variables: {
            filters: req.filterableFields,
            ...req.queryConfig.pagination,
            ...context,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: products, metadata } = await remoteQuery(queryObject);
    if (withInventoryQuantity) {
        await (0, middlewares_1.wrapVariantsWithInventoryQuantityForSalesChannel)(req, products.map((product) => product.variants).flat(1));
    }
    await (0, helpers_1.wrapProductsWithTaxPrices)(req, products);
    res.json({
        products,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
}
//# sourceMappingURL=route.js.map