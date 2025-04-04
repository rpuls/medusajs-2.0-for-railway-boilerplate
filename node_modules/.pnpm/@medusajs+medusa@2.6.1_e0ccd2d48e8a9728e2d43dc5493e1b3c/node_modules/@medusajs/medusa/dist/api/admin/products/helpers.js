"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBatchVariantInventoryData = exports.refetchBatchVariants = exports.refetchBatchProducts = exports.refetchVariant = exports.buildRules = exports.remapVariantResponse = exports.remapProductResponse = exports.remapKeysForVariant = exports.remapKeysForProduct = void 0;
const utils_1 = require("@medusajs/framework/utils");
const isPricing = (fieldName) => fieldName.startsWith("variants.prices") ||
    fieldName.startsWith("*variants.prices") ||
    fieldName.startsWith("prices") ||
    fieldName.startsWith("*prices");
// The variant had prices before, but that is not part of the price_set money amounts. Do we remap the request and response or not?
const remapKeysForProduct = (selectFields) => {
    const productFields = selectFields.filter((fieldName) => !isPricing(fieldName));
    const pricingFields = selectFields
        .filter((fieldName) => isPricing(fieldName))
        .map((fieldName) => fieldName.replace("variants.prices.", "variants.price_set.prices."));
    return [...productFields, ...pricingFields];
};
exports.remapKeysForProduct = remapKeysForProduct;
const remapKeysForVariant = (selectFields) => {
    const variantFields = selectFields.filter((fieldName) => !isPricing(fieldName));
    const pricingFields = selectFields
        .filter((fieldName) => isPricing(fieldName))
        .map((fieldName) => fieldName.replace("prices.", "price_set.prices."));
    return [...variantFields, ...pricingFields];
};
exports.remapKeysForVariant = remapKeysForVariant;
const remapProductResponse = (product) => {
    return {
        ...product,
        variants: product.variants?.map(exports.remapVariantResponse),
        // TODO: Remove any once all typings are cleaned up
    };
};
exports.remapProductResponse = remapProductResponse;
const remapVariantResponse = (variant) => {
    if (!variant) {
        return variant;
    }
    const resp = {
        ...variant,
        prices: variant.price_set?.prices?.map((price) => ({
            id: price.id,
            amount: price.amount,
            currency_code: price.currency_code,
            min_quantity: price.min_quantity,
            max_quantity: price.max_quantity,
            variant_id: variant.id,
            created_at: price.created_at,
            updated_at: price.updated_at,
            rules: (0, exports.buildRules)(price),
        })),
    };
    delete resp.price_set;
    // TODO: Remove any once all typings are cleaned up
    return resp;
};
exports.remapVariantResponse = remapVariantResponse;
const buildRules = (price) => {
    const rules = {};
    for (const priceRule of price.price_rules || []) {
        const ruleAttribute = priceRule.attribute;
        if (ruleAttribute) {
            rules[ruleAttribute] = priceRule.value;
        }
    }
    return rules;
};
exports.buildRules = buildRules;
const refetchVariant = async (variantId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "product_variant",
        variables: {
            filters: { id: variantId },
        },
        fields: (0, exports.remapKeysForVariant)(fields ?? []),
    });
    const [variant] = await remoteQuery(queryObject);
    return (0, exports.remapVariantResponse)(variant);
};
exports.refetchVariant = refetchVariant;
const refetchBatchProducts = async (batchResult, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    let created = Promise.resolve([]);
    let updated = Promise.resolve([]);
    if (batchResult.created.length) {
        const createdQuery = (0, utils_1.remoteQueryObjectFromString)({
            entryPoint: "product",
            variables: {
                filters: { id: batchResult.created.map((p) => p.id) },
            },
            fields: (0, exports.remapKeysForProduct)(fields ?? []),
        });
        created = remoteQuery(createdQuery);
    }
    if (batchResult.updated.length) {
        const updatedQuery = (0, utils_1.remoteQueryObjectFromString)({
            entryPoint: "product",
            variables: {
                filters: { id: batchResult.updated.map((p) => p.id) },
            },
            fields: (0, exports.remapKeysForProduct)(fields ?? []),
        });
        updated = remoteQuery(updatedQuery);
    }
    const [createdRes, updatedRes] = await (0, utils_1.promiseAll)([created, updated]);
    return {
        created: createdRes,
        updated: updatedRes,
        deleted: {
            ids: batchResult.deleted,
            object: "product",
            deleted: true,
        },
    };
};
exports.refetchBatchProducts = refetchBatchProducts;
const refetchBatchVariants = async (batchResult, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    let created = Promise.resolve([]);
    let updated = Promise.resolve([]);
    if (batchResult.created.length) {
        const createdQuery = (0, utils_1.remoteQueryObjectFromString)({
            entryPoint: "variant",
            variables: {
                filters: { id: batchResult.created.map((v) => v.id) },
            },
            fields: (0, exports.remapKeysForVariant)(fields ?? []),
        });
        created = remoteQuery(createdQuery);
    }
    if (batchResult.updated.length) {
        const updatedQuery = (0, utils_1.remoteQueryObjectFromString)({
            entryPoint: "variant",
            variables: {
                filters: { id: batchResult.updated.map((v) => v.id) },
            },
            fields: (0, exports.remapKeysForVariant)(fields ?? []),
        });
        updated = remoteQuery(updatedQuery);
    }
    const [createdRes, updatedRes] = await (0, utils_1.promiseAll)([created, updated]);
    return {
        created: createdRes,
        updated: updatedRes,
        deleted: {
            ids: batchResult.deleted,
            object: "variant",
            deleted: true,
        },
    };
};
exports.refetchBatchVariants = refetchBatchVariants;
const buildBatchVariantInventoryData = (inputs) => {
    const results = [];
    for (const input of inputs || []) {
        const result = {
            [utils_1.Modules.PRODUCT]: { variant_id: input.variant_id },
            [utils_1.Modules.INVENTORY]: {
                inventory_item_id: input.inventory_item_id,
            },
        };
        if ("required_quantity" in input) {
            result.data = {
                required_quantity: input.required_quantity,
            };
        }
        results.push(result);
    }
    return results;
};
exports.buildBatchVariantInventoryData = buildBatchVariantInventoryData;
//# sourceMappingURL=helpers.js.map