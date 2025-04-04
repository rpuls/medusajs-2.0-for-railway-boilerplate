"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateUser = exports.AdminCreateUser = exports.AdminGetUsersParams = exports.AdminGetUserParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
exports.AdminGetUserParams = (0, validators_1.createSelectParams)();
exports.AdminGetUsersParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 50,
}).merge(zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
    email: zod_1.z.string().nullish(),
    first_name: zod_1.z.string().nullish(),
    last_name: zod_1.z.string().nullish(),
}));
exports.AdminCreateUser = zod_1.z.object({
    email: zod_1.z.string(),
    first_name: zod_1.z.string().nullish(),
    last_name: zod_1.z.string().nullish(),
    avatar_url: zod_1.z.string().nullish(),
});
exports.AdminUpdateUser = zod_1.z.object({
    first_name: zod_1.z.string().nullish(),
    last_name: zod_1.z.string().nullish(),
    avatar_url: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish().optional(),
});
//# sourceMappingURL=validators.js.map