"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGetNotificationsParams = exports.AdminGetNotificationsParamsFields = exports.AdminGetNotificationParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.AdminGetNotificationParams = (0, validators_1.createSelectParams)();
exports.AdminGetNotificationsParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    channel: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
});
exports.AdminGetNotificationsParams = (0, validators_1.createFindParams)({
    limit: 50,
    offset: 0,
    order: "-created_at",
})
    .merge(exports.AdminGetNotificationsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetNotificationsParamsFields));
//# sourceMappingURL=validators.js.map