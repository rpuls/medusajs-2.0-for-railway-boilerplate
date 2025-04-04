"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCreateStockLocationFulfillmentSet = exports.AdminUpdateStockLocation = exports.AdminCreateStockLocation = exports.AdminUpsertStockLocationAddress = exports.AdminGetStockLocationsParams = exports.AdminGetStockLocationsParamsDirectFields = exports.AdminGetStockLocationParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.AdminGetStockLocationParams = (0, validators_1.createSelectParams)();
exports.AdminGetStockLocationsParamsDirectFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    name: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    address_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetStockLocationsParams = (0, validators_1.createFindParams)({
    limit: 20,
    offset: 0,
})
    .merge(exports.AdminGetStockLocationsParamsDirectFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetStockLocationsParamsDirectFields))
    .merge(zod_1.z.object({
    sales_channel_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
}));
exports.AdminUpsertStockLocationAddress = zod_1.z.object({
    address_1: zod_1.z.string(),
    address_2: zod_1.z.string().nullish(),
    company: zod_1.z.string().nullish(),
    city: zod_1.z.string().nullish(),
    country_code: zod_1.z.string(),
    phone: zod_1.z.string().nullish(),
    postal_code: zod_1.z.string().nullish(),
    province: zod_1.z.string().nullish(),
});
exports.AdminCreateStockLocation = zod_1.z.object({
    name: zod_1.z.preprocess((val) => val.trim(), zod_1.z.string()),
    address: exports.AdminUpsertStockLocationAddress.optional(),
    address_id: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.AdminUpdateStockLocation = zod_1.z.object({
    name: zod_1.z
        .preprocess((val) => val.trim(), zod_1.z.string().optional())
        .optional(),
    address: exports.AdminUpsertStockLocationAddress.optional(),
    address_id: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.AdminCreateStockLocationFulfillmentSet = zod_1.z
    .object({
    name: zod_1.z.string(),
    type: zod_1.z.string(),
})
    .strict();
//# sourceMappingURL=validators.js.map