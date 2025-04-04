"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMarkPaymentCollectionPaid = exports.AdminCreatePaymentCollection = exports.AdminGetPaymentCollectionParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
exports.AdminGetPaymentCollectionParams = (0, validators_1.createSelectParams)();
exports.AdminCreatePaymentCollection = zod_1.z
    .object({
    order_id: zod_1.z.string(),
    amount: zod_1.z.number(),
})
    .strict();
exports.AdminMarkPaymentCollectionPaid = zod_1.z
    .object({
    order_id: zod_1.z.string(),
})
    .strict();
//# sourceMappingURL=validators.js.map