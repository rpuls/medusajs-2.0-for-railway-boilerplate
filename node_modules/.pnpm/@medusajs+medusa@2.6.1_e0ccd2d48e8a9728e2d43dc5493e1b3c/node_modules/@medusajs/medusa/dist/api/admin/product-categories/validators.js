"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateProductCategory = exports.UpdateProductCategory = exports.AdminCreateProductCategory = exports.CreateProductCategory = exports.AdminProductCategoriesParams = exports.AdminProductCategoriesParamsFields = exports.AdminProductCategoryParams = void 0;
const zod_1 = require("zod");
const common_validators_1 = require("../../utils/common-validators");
const validators_1 = require("../../utils/validators");
exports.AdminProductCategoryParams = (0, validators_1.createSelectParams)().merge(zod_1.z.object({
    include_ancestors_tree: (0, common_validators_1.booleanString)().optional(),
    include_descendants_tree: (0, common_validators_1.booleanString)().optional(),
}));
exports.AdminProductCategoriesParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    description: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    handle: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    parent_category_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    include_ancestors_tree: (0, common_validators_1.booleanString)().optional(),
    include_descendants_tree: (0, common_validators_1.booleanString)().optional(),
    is_internal: (0, common_validators_1.booleanString)().optional(),
    is_active: (0, common_validators_1.booleanString)().optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminProductCategoriesParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 50,
})
    .merge(exports.AdminProductCategoriesParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminProductCategoriesParamsFields));
exports.CreateProductCategory = zod_1.z
    .object({
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    handle: zod_1.z.string().optional(),
    is_internal: zod_1.z.boolean().optional(),
    is_active: zod_1.z.boolean().optional(),
    parent_category_id: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
    rank: zod_1.z.number().nonnegative().optional(),
})
    .strict();
exports.AdminCreateProductCategory = (0, validators_1.WithAdditionalData)(exports.CreateProductCategory);
exports.UpdateProductCategory = zod_1.z
    .object({
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    handle: zod_1.z.string().optional(),
    is_internal: zod_1.z.boolean().optional(),
    is_active: zod_1.z.boolean().optional(),
    parent_category_id: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
    rank: zod_1.z.number().nonnegative().optional(),
})
    .strict();
exports.AdminUpdateProductCategory = (0, validators_1.WithAdditionalData)(exports.UpdateProductCategory);
//# sourceMappingURL=validators.js.map