"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCreatePaymentRefundReason = exports.AdminCreatePaymentRefund = exports.AdminCreatePaymentCapture = exports.AdminGetPaymentProvidersParams = exports.AdminGetPaymentProvidersParamsFields = exports.AdminGetPaymentsParams = exports.AdminGetPaymentsParamsFields = exports.AdminGetPaymentParams = void 0;
const zod_1 = require("zod");
const common_validators_1 = require("../../utils/common-validators");
const validators_1 = require("../../utils/validators");
exports.AdminGetPaymentParams = (0, validators_1.createSelectParams)();
exports.AdminGetPaymentsParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    payment_session_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetPaymentsParams = (0, validators_1.createFindParams)({
    limit: 20,
    offset: 0,
})
    .merge(exports.AdminGetPaymentsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetPaymentsParamsFields));
exports.AdminGetPaymentProvidersParamsFields = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    is_enabled: (0, common_validators_1.booleanString)().optional(),
});
exports.AdminGetPaymentProvidersParams = (0, validators_1.createFindParams)({
    limit: 20,
    offset: 0,
})
    .merge(exports.AdminGetPaymentProvidersParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetPaymentProvidersParamsFields));
exports.AdminCreatePaymentCapture = zod_1.z
    .object({
    amount: zod_1.z.number().optional(),
})
    .strict();
exports.AdminCreatePaymentRefund = zod_1.z
    .object({
    amount: zod_1.z.number().optional(),
    refund_reason_id: zod_1.z.string().optional(),
    note: zod_1.z.string().optional(),
})
    .strict();
exports.AdminCreatePaymentRefundReason = zod_1.z
    .object({
    label: zod_1.z.string(),
    description: zod_1.z.string().optional(),
})
    .strict();
//# sourceMappingURL=validators.js.map