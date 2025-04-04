"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGetRefundReasonsParams = exports.AdminUpdatePaymentRefundReason = exports.AdminCreatePaymentRefundReason = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
exports.AdminCreatePaymentRefundReason = zod_1.z
    .object({
    label: zod_1.z.string(),
    description: zod_1.z.string().nullish(),
})
    .strict();
exports.AdminUpdatePaymentRefundReason = zod_1.z
    .object({
    label: zod_1.z.string().optional(),
    description: zod_1.z.string().nullish(),
})
    .strict();
/**
 * Parameters used to filter and configure the pagination of the retrieved refund reason.
 */
exports.AdminGetRefundReasonsParams = (0, validators_1.createFindParams)({
    limit: 15,
    offset: 0,
}).merge(zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    q: zod_1.z.string().optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
}));
//# sourceMappingURL=validators.js.map