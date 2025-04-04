"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorePostReturnsReqSchema = exports.ReturnsParams = exports.ReturnsParamsFields = exports.ReturnParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.ReturnParams = (0, validators_1.createSelectParams)();
exports.ReturnsParamsFields = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    order_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
});
exports.ReturnsParams = (0, validators_1.createFindParams)()
    .merge(exports.ReturnsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.ReturnsParamsFields));
const ReturnShippingSchema = zod_1.z.object({
    option_id: zod_1.z.string(),
    price: zod_1.z.number().optional(),
});
const ItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    quantity: zod_1.z.number().min(1),
    reason_id: zod_1.z.string().nullish(),
    note: zod_1.z.string().nullish(),
});
exports.StorePostReturnsReqSchema = zod_1.z.object({
    order_id: zod_1.z.string(),
    items: zod_1.z.array(ItemSchema),
    return_shipping: ReturnShippingSchema,
    note: zod_1.z.string().nullish(),
    receive_now: zod_1.z.boolean().optional(),
    location_id: zod_1.z.string().nullish(),
});
//# sourceMappingURL=validators.js.map