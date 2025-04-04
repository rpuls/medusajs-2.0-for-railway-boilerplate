"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreGetProductsParams = exports.StoreGetProductsParamsFields = exports.StoreGetProductVariantsParams = exports.StoreGetProductVariantsParamsFields = exports.StoreGetProductParams = exports.StoreGetProductParamsFields = void 0;
const zod_1 = require("zod");
const common_validators_1 = require("../../utils/common-validators");
const validators_1 = require("../../utils/validators");
exports.StoreGetProductParamsFields = zod_1.z.object({
    region_id: zod_1.z.string().optional(),
    country_code: zod_1.z.string().optional(),
    province: zod_1.z.string().optional(),
    cart_id: zod_1.z.string().optional(),
});
exports.StoreGetProductParams = (0, validators_1.createSelectParams)().merge(exports.StoreGetProductParamsFields);
exports.StoreGetProductVariantsParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    sku: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    options: zod_1.z
        .object({ value: zod_1.z.string().optional(), option_id: zod_1.z.string().optional() })
        .optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.StoreGetProductVariantsParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 50,
})
    .merge(exports.StoreGetProductVariantsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.StoreGetProductVariantsParamsFields));
exports.StoreGetProductsParamsFields = zod_1.z
    .object({
    region_id: zod_1.z.string().optional(),
    country_code: zod_1.z.string().optional(),
    province: zod_1.z.string().optional(),
    cart_id: zod_1.z.string().optional(),
})
    .merge(common_validators_1.GetProductsParams)
    .strict();
exports.StoreGetProductsParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 50,
})
    .merge(exports.StoreGetProductsParamsFields)
    .merge(zod_1.z
    .object({
    variants: zod_1.z
        .object({
        options: zod_1.z
            .object({
            value: zod_1.z.string().optional(),
            option_id: zod_1.z.string().optional(),
        })
            .optional(),
    })
        .merge((0, common_validators_1.applyAndAndOrOperators)(exports.StoreGetProductVariantsParamsFields))
        .optional(),
})
    .merge((0, common_validators_1.applyAndAndOrOperators)(common_validators_1.StoreGetProductParamsDirectFields))
    .strict())
    .transform((0, common_validators_1.recursivelyNormalizeSchema)(common_validators_1.transformProductParams));
//# sourceMappingURL=validators.js.map