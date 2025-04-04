"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminBatchDeleteVariantInventoryItem = exports.AdminBatchUpdateVariantInventoryItem = exports.AdminBatchCreateVariantInventoryItem = exports.AdminUpdateVariantInventoryItem = exports.AdminCreateVariantInventoryItem = exports.AdminBatchUpdateProduct = exports.AdminUpdateProduct = exports.UpdateProduct = exports.AdminCreateProduct = exports.CreateProduct = exports.IdAssociation = exports.AdminBatchUpdateProductVariant = exports.AdminUpdateProductVariant = exports.UpdateProductVariant = exports.AdminCreateProductVariant = exports.CreateProductVariant = exports.AdminCreateProductType = exports.AdminUpdateVariantPrice = exports.AdminCreateVariantPrice = exports.AdminUpdateProductOption = exports.UpdateProductOption = exports.AdminCreateProductOption = exports.CreateProductOption = exports.AdminUpdateProductTag = exports.AdminCreateProductTag = exports.AdminGetProductOptionsParams = exports.AdminGetProductOptionsParamsFields = exports.AdminGetProductsParams = exports.AdminGetProductsParamsDirectFields = exports.AdminGetProductVariantsParams = exports.AdminGetProductVariantsParamsFields = exports.AdminGetProductOptionParams = exports.AdminGetProductVariantParams = exports.AdminGetProductParams = void 0;
const utils_1 = require("@medusajs/framework/utils");
const zod_1 = require("zod");
const common_validators_1 = require("../../utils/common-validators");
const validators_1 = require("../../utils/validators");
const statusEnum = zod_1.z.nativeEnum(utils_1.ProductStatus);
exports.AdminGetProductParams = (0, validators_1.createSelectParams)();
exports.AdminGetProductVariantParams = (0, validators_1.createSelectParams)();
exports.AdminGetProductOptionParams = (0, validators_1.createSelectParams)();
exports.AdminGetProductVariantsParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    manage_inventory: (0, common_validators_1.booleanString)().optional(),
    allow_backorder: (0, common_validators_1.booleanString)().optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetProductVariantsParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 50,
})
    .merge(exports.AdminGetProductVariantsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetProductVariantsParamsFields));
exports.AdminGetProductsParamsDirectFields = zod_1.z.object({
    variants: exports.AdminGetProductVariantsParamsFields.merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetProductVariantsParamsFields)).optional(),
    status: statusEnum.array().optional(),
});
exports.AdminGetProductsParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 50,
})
    .merge(exports.AdminGetProductsParamsDirectFields)
    .merge(zod_1.z
    .object({
    price_list_id: zod_1.z.string().array().optional(),
})
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetProductsParamsDirectFields))
    .merge(common_validators_1.GetProductsParams))
    .transform(common_validators_1.transformProductParams);
exports.AdminGetProductOptionsParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    title: zod_1.z.string().optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetProductOptionsParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 50,
})
    .merge(exports.AdminGetProductOptionsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetProductOptionsParamsFields));
exports.AdminCreateProductTag = zod_1.z.object({
    value: zod_1.z.string(),
});
exports.AdminUpdateProductTag = zod_1.z.object({
    id: zod_1.z.string().optional(),
    value: zod_1.z.string().optional(),
});
exports.CreateProductOption = zod_1.z.object({
    title: zod_1.z.string(),
    values: zod_1.z.array(zod_1.z.string()),
});
exports.AdminCreateProductOption = (0, validators_1.WithAdditionalData)(exports.CreateProductOption);
exports.UpdateProductOption = zod_1.z.object({
    id: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    values: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.AdminUpdateProductOption = (0, validators_1.WithAdditionalData)(exports.UpdateProductOption);
exports.AdminCreateVariantPrice = zod_1.z.object({
    currency_code: zod_1.z.string(),
    amount: zod_1.z.number(),
    min_quantity: zod_1.z.number().nullish(),
    max_quantity: zod_1.z.number().nullish(),
    rules: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
});
exports.AdminUpdateVariantPrice = zod_1.z.object({
    id: zod_1.z.string().optional(),
    currency_code: zod_1.z.string().optional(),
    amount: zod_1.z.number().optional(),
    min_quantity: zod_1.z.number().nullish(),
    max_quantity: zod_1.z.number().nullish(),
    rules: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
});
exports.AdminCreateProductType = zod_1.z.object({
    value: zod_1.z.string(),
});
exports.CreateProductVariant = zod_1.z
    .object({
    title: zod_1.z.string(),
    sku: zod_1.z.string().nullish(),
    ean: zod_1.z.string().nullish(),
    upc: zod_1.z.string().nullish(),
    barcode: zod_1.z.string().nullish(),
    hs_code: zod_1.z.string().nullish(),
    mid_code: zod_1.z.string().nullish(),
    allow_backorder: (0, common_validators_1.booleanString)().optional().default(false),
    manage_inventory: (0, common_validators_1.booleanString)().optional().default(true),
    variant_rank: zod_1.z.number().optional(),
    weight: zod_1.z.number().nullish(),
    length: zod_1.z.number().nullish(),
    height: zod_1.z.number().nullish(),
    width: zod_1.z.number().nullish(),
    origin_country: zod_1.z.string().nullish(),
    material: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
    prices: zod_1.z.array(exports.AdminCreateVariantPrice),
    options: zod_1.z.record(zod_1.z.string()).optional(),
    inventory_items: zod_1.z
        .array(zod_1.z.object({
        inventory_item_id: zod_1.z.string(),
        required_quantity: zod_1.z.number(),
    }))
        .optional(),
})
    .strict();
exports.AdminCreateProductVariant = (0, validators_1.WithAdditionalData)(exports.CreateProductVariant);
exports.UpdateProductVariant = zod_1.z
    .object({
    id: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    prices: zod_1.z.array(exports.AdminUpdateVariantPrice).optional(),
    sku: zod_1.z.string().nullish(),
    ean: zod_1.z.string().nullish(),
    upc: zod_1.z.string().nullish(),
    barcode: zod_1.z.string().nullish(),
    hs_code: zod_1.z.string().nullish(),
    mid_code: zod_1.z.string().nullish(),
    allow_backorder: (0, common_validators_1.booleanString)().optional(),
    manage_inventory: (0, common_validators_1.booleanString)().optional(),
    variant_rank: zod_1.z.number().optional(),
    weight: zod_1.z.number().nullish(),
    length: zod_1.z.number().nullish(),
    height: zod_1.z.number().nullish(),
    width: zod_1.z.number().nullish(),
    origin_country: zod_1.z.string().nullish(),
    material: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
    options: zod_1.z.record(zod_1.z.string()).optional(),
})
    .strict();
exports.AdminUpdateProductVariant = (0, validators_1.WithAdditionalData)(exports.UpdateProductVariant);
exports.AdminBatchUpdateProductVariant = exports.UpdateProductVariant.extend({
    id: zod_1.z.string(),
});
exports.IdAssociation = zod_1.z.object({
    id: zod_1.z.string(),
});
exports.CreateProduct = zod_1.z
    .object({
    title: zod_1.z.string(),
    subtitle: zod_1.z.string().nullish(),
    description: zod_1.z.string().nullish(),
    is_giftcard: (0, common_validators_1.booleanString)().optional().default(false),
    discountable: (0, common_validators_1.booleanString)().optional().default(true),
    images: zod_1.z.array(zod_1.z.object({ url: zod_1.z.string() })).optional(),
    thumbnail: zod_1.z.string().nullish(),
    handle: zod_1.z.string().optional(),
    status: statusEnum.nullish().default(utils_1.ProductStatus.DRAFT),
    external_id: zod_1.z.string().nullish(),
    type_id: zod_1.z.string().nullish(),
    collection_id: zod_1.z.string().nullish(),
    categories: zod_1.z.array(exports.IdAssociation).optional(),
    tags: zod_1.z.array(exports.IdAssociation).optional(),
    options: zod_1.z.array(exports.CreateProductOption).optional(),
    variants: zod_1.z.array(exports.CreateProductVariant).optional(),
    sales_channels: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string() })).optional(),
    shipping_profile_id: zod_1.z.string().optional(),
    weight: zod_1.z.number().nullish(),
    length: zod_1.z.number().nullish(),
    height: zod_1.z.number().nullish(),
    width: zod_1.z.number().nullish(),
    hs_code: zod_1.z.string().nullish(),
    mid_code: zod_1.z.string().nullish(),
    origin_country: zod_1.z.string().nullish(),
    material: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
exports.AdminCreateProduct = (0, validators_1.WithAdditionalData)(exports.CreateProduct);
exports.UpdateProduct = zod_1.z
    .object({
    title: zod_1.z.string().optional(),
    discountable: (0, common_validators_1.booleanString)().optional(),
    is_giftcard: (0, common_validators_1.booleanString)().optional(),
    options: zod_1.z.array(exports.UpdateProductOption).optional(),
    variants: zod_1.z.array(exports.UpdateProductVariant).optional(),
    status: statusEnum.optional(),
    subtitle: zod_1.z.string().nullish(),
    description: zod_1.z.string().nullish(),
    images: zod_1.z.array(zod_1.z.object({ url: zod_1.z.string() })).optional(),
    thumbnail: zod_1.z.string().nullish(),
    handle: zod_1.z.string().nullish(),
    type_id: zod_1.z.string().nullish(),
    external_id: zod_1.z.string().nullish(),
    collection_id: zod_1.z.string().nullish(),
    categories: zod_1.z.array(exports.IdAssociation).optional(),
    tags: zod_1.z.array(exports.IdAssociation).optional(),
    sales_channels: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string() })).optional(),
    shipping_profile_id: zod_1.z.string().nullish(),
    weight: zod_1.z.number().nullish(),
    length: zod_1.z.number().nullish(),
    height: zod_1.z.number().nullish(),
    width: zod_1.z.number().nullish(),
    hs_code: zod_1.z.string().nullish(),
    mid_code: zod_1.z.string().nullish(),
    origin_country: zod_1.z.string().nullish(),
    material: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
exports.AdminUpdateProduct = (0, validators_1.WithAdditionalData)(exports.UpdateProduct);
exports.AdminBatchUpdateProduct = exports.UpdateProduct.extend({
    id: zod_1.z.string(),
});
exports.AdminCreateVariantInventoryItem = zod_1.z.object({
    required_quantity: zod_1.z.number(),
    inventory_item_id: zod_1.z.string(),
});
exports.AdminUpdateVariantInventoryItem = zod_1.z.object({
    required_quantity: zod_1.z.number(),
});
exports.AdminBatchCreateVariantInventoryItem = zod_1.z
    .object({
    required_quantity: zod_1.z.number(),
    inventory_item_id: zod_1.z.string(),
    variant_id: zod_1.z.string(),
})
    .strict();
exports.AdminBatchUpdateVariantInventoryItem = zod_1.z
    .object({
    required_quantity: zod_1.z.number(),
    inventory_item_id: zod_1.z.string(),
    variant_id: zod_1.z.string(),
})
    .strict();
exports.AdminBatchDeleteVariantInventoryItem = zod_1.z
    .object({
    inventory_item_id: zod_1.z.string(),
    variant_id: zod_1.z.string(),
})
    .strict();
//# sourceMappingURL=validators.js.map