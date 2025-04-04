"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateProductTag = exports.AdminCreateProductTag = exports.AdminGetProductTagsParams = exports.AdminGetProductTagsParamsFields = exports.AdminGetProductTagParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.AdminGetProductTagParams = (0, validators_1.createSelectParams)();
exports.AdminGetProductTagsParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetProductTagsParams = (0, validators_1.createFindParams)({
    limit: 20,
    offset: 0,
})
    .merge(exports.AdminGetProductTagsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetProductTagsParamsFields));
exports.AdminCreateProductTag = zod_1.z
    .object({
    value: zod_1.z.string(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
exports.AdminUpdateProductTag = zod_1.z
    .object({
    value: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
//# sourceMappingURL=validators.js.map