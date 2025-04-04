"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreProductTypesParams = exports.StoreProductTypesParamsFields = exports.StoreProductTypeParams = void 0;
const zod_1 = require("zod");
const common_validators_1 = require("../../utils/common-validators");
const validators_1 = require("../../utils/validators");
exports.StoreProductTypeParams = (0, validators_1.createSelectParams)().merge(zod_1.z.object({}));
exports.StoreProductTypesParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.StoreProductTypesParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 50,
})
    .merge(exports.StoreProductTypesParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.StoreProductTypesParamsFields));
//# sourceMappingURL=validators.js.map