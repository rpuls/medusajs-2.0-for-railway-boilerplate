"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateSalesChannel = exports.AdminCreateSalesChannel = exports.AdminGetSalesChannelsParams = exports.AdminGetSalesChannelsParamsDirectFields = exports.AdminGetSalesChannelParams = void 0;
const zod_1 = require("zod");
const common_validators_1 = require("../../utils/common-validators");
const validators_1 = require("../../utils/validators");
exports.AdminGetSalesChannelParams = (0, validators_1.createSelectParams)();
exports.AdminGetSalesChannelsParamsDirectFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    name: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    description: zod_1.z.string().optional(),
    is_disabled: (0, common_validators_1.booleanString)().optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetSalesChannelsParams = (0, validators_1.createFindParams)({
    limit: 20,
    offset: 0,
})
    .merge(exports.AdminGetSalesChannelsParamsDirectFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetSalesChannelsParamsDirectFields))
    .merge(zod_1.z.object({
    location_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    publishable_key_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
}));
exports.AdminCreateSalesChannel = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string().nullish(),
    is_disabled: zod_1.z.boolean().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.AdminUpdateSalesChannel = zod_1.z.object({
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().nullish(),
    is_disabled: zod_1.z.boolean().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
//# sourceMappingURL=validators.js.map