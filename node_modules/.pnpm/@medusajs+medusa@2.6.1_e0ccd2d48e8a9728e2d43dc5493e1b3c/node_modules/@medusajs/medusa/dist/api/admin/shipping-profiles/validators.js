"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateShippingProfile = exports.AdminCreateShippingProfile = exports.AdminGetShippingProfilesParams = exports.AdminGetShippingProfilesParamsFields = exports.AdminGetShippingProfileParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.AdminGetShippingProfileParams = (0, validators_1.createSelectParams)();
exports.AdminGetShippingProfilesParamsFields = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    q: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetShippingProfilesParams = (0, validators_1.createFindParams)({
    limit: 20,
    offset: 0,
})
    .merge(exports.AdminGetShippingProfilesParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetShippingProfilesParamsFields));
exports.AdminCreateShippingProfile = zod_1.z
    .object({
    name: zod_1.z.string(),
    type: zod_1.z.string(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
exports.AdminUpdateShippingProfile = zod_1.z
    .object({
    name: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
//# sourceMappingURL=validators.js.map