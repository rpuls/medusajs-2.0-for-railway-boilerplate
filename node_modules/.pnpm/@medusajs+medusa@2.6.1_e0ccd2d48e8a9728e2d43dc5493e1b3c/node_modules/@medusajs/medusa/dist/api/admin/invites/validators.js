"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminInviteAccept = exports.AdminCreateInvite = exports.AdminGetInviteAcceptParams = exports.AdminGetInvitesParams = exports.AdminGetInvitesParamsFields = exports.AdminGetInviteParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.AdminGetInviteParams = (0, validators_1.createSelectParams)();
exports.AdminGetInvitesParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    email: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetInvitesParams = (0, validators_1.createFindParams)({
    limit: 50,
    offset: 0,
})
    .merge(exports.AdminGetInvitesParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetInvitesParamsFields));
exports.AdminGetInviteAcceptParams = (0, validators_1.createSelectParams)().merge(zod_1.z.object({
    token: zod_1.z.string(),
}));
exports.AdminCreateInvite = zod_1.z
    .object({
    email: zod_1.z.string(),
})
    .strict();
exports.AdminInviteAccept = zod_1.z
    .object({
    email: zod_1.z.string().nullish(),
    first_name: zod_1.z.string().nullish(),
    last_name: zod_1.z.string().nullish(),
})
    .strict();
//# sourceMappingURL=validators.js.map