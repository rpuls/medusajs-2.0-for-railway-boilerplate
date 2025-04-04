"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBuilders = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.eventBuilders = {
    createdProduct: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.CREATED,
        object: "product",
        eventName: utils_1.ProductEvents.PRODUCT_CREATED,
    }),
    updatedProduct: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.UPDATED,
        object: "product",
        eventName: utils_1.ProductEvents.PRODUCT_UPDATED,
    }),
    deletedProduct: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.DELETED,
        object: "product",
        eventName: utils_1.ProductEvents.PRODUCT_DELETED,
    }),
    createdProductVariant: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.CREATED,
        object: "product_variant",
        eventName: utils_1.ProductEvents.PRODUCT_VARIANT_CREATED,
    }),
    updatedProductVariant: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.UPDATED,
        object: "product_variant",
        eventName: utils_1.ProductEvents.PRODUCT_VARIANT_UPDATED,
    }),
    deletedProductVariant: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.DELETED,
        object: "product_variant",
        eventName: utils_1.ProductEvents.PRODUCT_VARIANT_DELETED,
    }),
    createdProductOption: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.CREATED,
        object: "product_option",
        eventName: utils_1.ProductEvents.PRODUCT_OPTION_CREATED,
    }),
    updatedProductOption: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.UPDATED,
        object: "product_option",
        eventName: utils_1.ProductEvents.PRODUCT_OPTION_UPDATED,
    }),
    deletedProductOption: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.DELETED,
        object: "product_option",
        eventName: utils_1.ProductEvents.PRODUCT_OPTION_DELETED,
    }),
    createdProductType: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.CREATED,
        object: "product_type",
        eventName: utils_1.ProductEvents.PRODUCT_TYPE_CREATED,
    }),
    updatedProductType: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.UPDATED,
        object: "product_type",
        eventName: utils_1.ProductEvents.PRODUCT_TYPE_UPDATED,
    }),
    deletedProductType: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.DELETED,
        object: "product_type",
        eventName: utils_1.ProductEvents.PRODUCT_TYPE_DELETED,
    }),
    createdProductTag: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.CREATED,
        object: "product_tag",
        eventName: utils_1.ProductEvents.PRODUCT_TAG_CREATED,
    }),
    updatedProductTag: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.UPDATED,
        object: "product_tag",
        eventName: utils_1.ProductEvents.PRODUCT_TAG_UPDATED,
    }),
    deletedProductTag: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.DELETED,
        object: "product_tag",
        eventName: utils_1.ProductEvents.PRODUCT_TAG_DELETED,
    }),
    createdProductCategory: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.CREATED,
        object: "product_category",
        eventName: utils_1.ProductEvents.PRODUCT_CATEGORY_CREATED,
    }),
    updatedProductCategory: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.UPDATED,
        object: "product_category",
        eventName: utils_1.ProductEvents.PRODUCT_CATEGORY_UPDATED,
    }),
    deletedProductCategory: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.DELETED,
        object: "product_category",
        eventName: utils_1.ProductEvents.PRODUCT_CATEGORY_DELETED,
    }),
    createdProductCollection: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.CREATED,
        object: "product_collection",
        eventName: utils_1.ProductEvents.PRODUCT_COLLECTION_CREATED,
    }),
    updatedProductCollection: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.UPDATED,
        object: "product_collection",
        eventName: utils_1.ProductEvents.PRODUCT_COLLECTION_UPDATED,
    }),
    deletedProductCollection: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.DELETED,
        object: "product_collection",
        eventName: utils_1.ProductEvents.PRODUCT_COLLECTION_DELETED,
    }),
    createdProductOptionValue: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.CREATED,
        object: "product_option_value",
        eventName: utils_1.ProductEvents.PRODUCT_OPTION_VALUE_CREATED,
    }),
    updatedProductOptionValue: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.UPDATED,
        object: "product_option_value",
        eventName: utils_1.ProductEvents.PRODUCT_OPTION_VALUE_UPDATED,
    }),
    deletedProductOptionValue: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.PRODUCT,
        action: utils_1.CommonEvents.DELETED,
        object: "product_option_value",
        eventName: utils_1.ProductEvents.PRODUCT_OPTION_VALUE_DELETED,
    }),
};
//# sourceMappingURL=events.js.map