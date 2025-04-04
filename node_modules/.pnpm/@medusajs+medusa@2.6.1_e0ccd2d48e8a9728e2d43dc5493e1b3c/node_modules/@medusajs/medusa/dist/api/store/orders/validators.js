"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreDeclineOrderTransferRequest = exports.StoreCancelOrderTransferRequest = exports.StoreRequestOrderTransfer = exports.StoreAcceptOrderTransfer = exports.StoreGetOrdersParams = exports.StoreGetOrdersParamsFields = exports.StoreGetOrderParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.StoreGetOrderParams = (0, validators_1.createSelectParams)();
exports.StoreGetOrdersParamsFields = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    status: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
});
exports.StoreGetOrdersParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 50,
})
    .merge(exports.StoreGetOrdersParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.StoreGetOrdersParamsFields));
exports.StoreAcceptOrderTransfer = zod_1.z.object({
    token: zod_1.z.string().min(1),
});
exports.StoreRequestOrderTransfer = zod_1.z.object({
    description: zod_1.z.string().optional(),
});
exports.StoreCancelOrderTransferRequest = zod_1.z.object({});
exports.StoreDeclineOrderTransferRequest = zod_1.z.object({
    token: zod_1.z.string().min(1),
});
//# sourceMappingURL=validators.js.map