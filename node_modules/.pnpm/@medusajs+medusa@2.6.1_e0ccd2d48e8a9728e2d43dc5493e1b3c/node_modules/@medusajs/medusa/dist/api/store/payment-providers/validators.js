"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreGetPaymentProvidersParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
exports.StoreGetPaymentProvidersParams = (0, validators_1.createFindParams)({
    limit: 20,
    offset: 0,
}).merge(zod_1.z.object({
    region_id: zod_1.z.string(),
}));
//# sourceMappingURL=validators.js.map