"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminBatchInventoryItemLevels = exports.AdminUpdateInventoryItem = exports.AdminCreateInventoryItem = exports.AdminUpdateInventoryLocationLevel = exports.AdminBatchInventoryItemLocationsLevel = exports.AdminUpdateInventoryLocationLevelBatch = exports.AdminCreateInventoryLocationLevel = exports.AdminGetInventoryLocationLevelsParams = exports.AdminGetInventoryLocationLevelsParamsFields = exports.AdminGetInventoryLocationLevelParams = exports.AdminGetInventoryItemsParams = exports.AdminGetInventoryItemsParamsFields = exports.AdminGetInventoryItemParams = void 0;
const zod_1 = require("zod");
const common_validators_1 = require("../../utils/common-validators");
const validators_1 = require("../../utils/validators");
exports.AdminGetInventoryItemParams = (0, validators_1.createSelectParams)();
exports.AdminGetInventoryItemsParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    sku: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    origin_country: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    mid_code: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    hs_code: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    material: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    requires_shipping: (0, common_validators_1.booleanString)().optional(),
    weight: (0, validators_1.createOperatorMap)(zod_1.z.number(), parseFloat).optional(),
    length: (0, validators_1.createOperatorMap)(zod_1.z.number(), parseFloat).optional(),
    height: (0, validators_1.createOperatorMap)(zod_1.z.number(), parseFloat).optional(),
    width: (0, validators_1.createOperatorMap)(zod_1.z.number(), parseFloat).optional(),
    location_levels: zod_1.z
        .object({
        location_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    })
        .optional(),
});
exports.AdminGetInventoryItemsParams = (0, validators_1.createFindParams)({
    limit: 20,
    offset: 0,
})
    .merge(exports.AdminGetInventoryItemsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetInventoryItemsParamsFields))
    .strict();
exports.AdminGetInventoryLocationLevelParams = (0, validators_1.createSelectParams)();
exports.AdminGetInventoryLocationLevelsParamsFields = zod_1.z.object({
    location_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
});
exports.AdminGetInventoryLocationLevelsParams = (0, validators_1.createFindParams)({
    limit: 50,
    offset: 0,
})
    .merge(exports.AdminGetInventoryLocationLevelsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetInventoryLocationLevelsParamsFields));
exports.AdminCreateInventoryLocationLevel = zod_1.z
    .object({
    location_id: zod_1.z.string(),
    stocked_quantity: zod_1.z.number().min(0).optional(),
    incoming_quantity: zod_1.z.number().min(0).optional(),
})
    .strict();
exports.AdminUpdateInventoryLocationLevelBatch = zod_1.z
    .object({
    id: zod_1.z.string().optional(),
    location_id: zod_1.z.string(),
    stocked_quantity: zod_1.z.number().min(0).optional(),
    incoming_quantity: zod_1.z.number().min(0).optional(),
})
    .strict();
exports.AdminBatchInventoryItemLocationsLevel = zod_1.z.object({
    create: zod_1.z.array(exports.AdminCreateInventoryLocationLevel).optional(),
    update: zod_1.z.array(exports.AdminUpdateInventoryLocationLevelBatch).optional(),
    delete: zod_1.z.array(zod_1.z.string()).optional(),
    force: zod_1.z.boolean().optional(),
});
exports.AdminUpdateInventoryLocationLevel = zod_1.z
    .object({
    stocked_quantity: zod_1.z.number().min(0).optional(),
    incoming_quantity: zod_1.z.number().min(0).optional(),
})
    .strict();
exports.AdminCreateInventoryItem = zod_1.z
    .object({
    sku: zod_1.z.string().nullish(),
    hs_code: zod_1.z.string().nullish(),
    weight: zod_1.z.number().nullish(),
    length: zod_1.z.number().nullish(),
    height: zod_1.z.number().nullish(),
    width: zod_1.z.number().nullish(),
    origin_country: zod_1.z.string().nullish(),
    mid_code: zod_1.z.string().nullish(),
    material: zod_1.z.string().nullish(),
    title: zod_1.z.string().nullish(),
    description: zod_1.z.string().nullish(),
    requires_shipping: zod_1.z.boolean().optional(),
    thumbnail: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
    location_levels: zod_1.z.array(exports.AdminCreateInventoryLocationLevel).optional(),
})
    .strict();
exports.AdminUpdateInventoryItem = zod_1.z
    .object({
    sku: zod_1.z.string().nullish(),
    hs_code: zod_1.z.string().nullish(),
    weight: zod_1.z.number().nullish(),
    length: zod_1.z.number().nullish(),
    height: zod_1.z.number().nullish(),
    width: zod_1.z.number().nullish(),
    origin_country: zod_1.z.string().nullish(),
    mid_code: zod_1.z.string().nullish(),
    material: zod_1.z.string().nullish(),
    title: zod_1.z.string().nullish(),
    description: zod_1.z.string().nullish(),
    requires_shipping: zod_1.z.boolean().optional(),
    thumbnail: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
const AdminBatchInventoryLocationLevel = zod_1.z.object({
    inventory_item_id: zod_1.z.string(),
    location_id: zod_1.z.string(),
    stocked_quantity: zod_1.z.number().min(0).optional(),
    incoming_quantity: zod_1.z.number().min(0).optional(),
});
exports.AdminBatchInventoryItemLevels = zod_1.z
    .object({
    create: zod_1.z.array(AdminBatchInventoryLocationLevel).optional(),
    update: zod_1.z.array(AdminBatchInventoryLocationLevel).optional(),
    delete: zod_1.z.array(zod_1.z.string()).optional(),
    force: zod_1.z.boolean().optional(),
})
    .strict();
//# sourceMappingURL=validators.js.map