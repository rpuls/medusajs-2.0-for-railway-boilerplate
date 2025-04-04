"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRevokeApiKey = exports.AdminUpdateApiKey = exports.AdminCreateApiKey = exports.AdminGetApiKeysParams = exports.AdminGetApiKeysParamsFields = exports.AdminGetApiKeyParams = void 0;
const utils_1 = require("@medusajs/framework/utils");
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.AdminGetApiKeyParams = (0, validators_1.createSelectParams)();
exports.AdminGetApiKeysParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    title: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    token: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    type: zod_1.z.nativeEnum(utils_1.ApiKeyType).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
    revoked_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetApiKeysParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 20,
})
    .merge(exports.AdminGetApiKeysParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetApiKeysParamsFields));
exports.AdminCreateApiKey = zod_1.z.object({
    title: zod_1.z.string(),
    type: zod_1.z.nativeEnum(utils_1.ApiKeyType),
});
exports.AdminUpdateApiKey = zod_1.z.object({
    title: zod_1.z.string(),
});
exports.AdminRevokeApiKey = zod_1.z.object({
    revoke_in: zod_1.z.number().optional(),
});
//# sourceMappingURL=validators.js.map