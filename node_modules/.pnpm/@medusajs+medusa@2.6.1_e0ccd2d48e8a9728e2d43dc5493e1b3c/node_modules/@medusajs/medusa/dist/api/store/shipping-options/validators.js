"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreCalculateShippingOptionPrice = exports.StoreGetShippingOptions = exports.StoreGetShippingOptionsFields = exports.StoreGetShippingOptionsParams = void 0;
const zod_1 = require("zod");
const common_validators_1 = require("../../utils/common-validators");
const validators_1 = require("../../utils/validators");
exports.StoreGetShippingOptionsParams = (0, validators_1.createSelectParams)();
exports.StoreGetShippingOptionsFields = zod_1.z
    .object({
    cart_id: zod_1.z.string(),
    is_return: zod_1.z.boolean().optional(),
})
    .strict();
exports.StoreGetShippingOptions = (0, validators_1.createFindParams)({
    limit: 20,
    offset: 0,
})
    .merge(exports.StoreGetShippingOptionsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.StoreGetShippingOptionsFields));
exports.StoreCalculateShippingOptionPrice = zod_1.z.object({
    cart_id: zod_1.z.string(),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
//# sourceMappingURL=validators.js.map