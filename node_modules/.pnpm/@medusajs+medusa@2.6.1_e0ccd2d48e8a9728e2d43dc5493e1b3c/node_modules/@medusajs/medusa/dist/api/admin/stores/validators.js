"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateStore = exports.AdminGetStoresParams = exports.AdminGetStoresParamsFields = exports.AdminGetStoreParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.AdminGetStoreParams = (0, validators_1.createSelectParams)();
exports.AdminGetStoresParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    name: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
});
exports.AdminGetStoresParams = (0, validators_1.createFindParams)({
    limit: 50,
    offset: 0,
})
    .merge(exports.AdminGetStoresParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetStoresParamsFields));
exports.AdminUpdateStore = zod_1.z.object({
    name: zod_1.z.string().optional(),
    supported_currencies: zod_1.z
        .array(zod_1.z.object({
        currency_code: zod_1.z.string(),
        is_default: zod_1.z.boolean().optional(),
        is_tax_inclusive: zod_1.z.boolean().optional(),
    }))
        .optional(),
    default_sales_channel_id: zod_1.z.string().nullish(),
    default_region_id: zod_1.z.string().nullish(),
    default_location_id: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
//# sourceMappingURL=validators.js.map