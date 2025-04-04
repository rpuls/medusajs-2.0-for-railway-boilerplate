"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateProductType = exports.AdminCreateProductType = exports.AdminGetProductTypesParams = exports.AdminGetProductTypesParamsFields = exports.AdminGetProductTypeParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.AdminGetProductTypeParams = (0, validators_1.createSelectParams)();
exports.AdminGetProductTypesParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    // TODO: To be added in next iteration, when coming from a different module, it should be separated from the direct fields
    // discount_condition_id: z.string().nullish(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetProductTypesParams = (0, validators_1.createFindParams)({
    limit: 10,
    offset: 0,
})
    .merge(exports.AdminGetProductTypesParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetProductTypesParamsFields));
exports.AdminCreateProductType = zod_1.z
    .object({
    value: zod_1.z.string(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
exports.AdminUpdateProductType = zod_1.z
    .object({
    value: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
//# sourceMappingURL=validators.js.map