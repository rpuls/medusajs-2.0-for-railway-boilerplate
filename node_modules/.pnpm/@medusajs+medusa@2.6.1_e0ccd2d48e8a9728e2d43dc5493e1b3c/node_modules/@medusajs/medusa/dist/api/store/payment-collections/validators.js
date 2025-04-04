"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreCreatePaymentCollection = exports.StoreCreatePaymentSession = exports.StoreGetPaymentCollectionParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
exports.StoreGetPaymentCollectionParams = (0, validators_1.createSelectParams)();
exports.StoreCreatePaymentSession = zod_1.z
    .object({
    provider_id: zod_1.z.string(),
    data: zod_1.z.record(zod_1.z.unknown()).optional(),
})
    .strict();
exports.StoreCreatePaymentCollection = zod_1.z
    .object({
    cart_id: zod_1.z.string(),
})
    .strict();
//# sourceMappingURL=validators.js.map