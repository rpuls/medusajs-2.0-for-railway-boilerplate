"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateRegion = exports.AdminCreateRegion = exports.AdminGetRegionsParams = exports.AdminGetRegionsParamsFields = exports.AdminGetRegionParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.AdminGetRegionParams = (0, validators_1.createSelectParams)();
exports.AdminGetRegionsParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    currency_code: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    name: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetRegionsParams = (0, validators_1.createFindParams)({
    limit: 50,
    offset: 0,
})
    .merge(exports.AdminGetRegionsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetRegionsParamsFields));
exports.AdminCreateRegion = zod_1.z
    .object({
    name: zod_1.z.string(),
    currency_code: zod_1.z.string(),
    countries: zod_1.z.array(zod_1.z.string()).optional(),
    automatic_taxes: zod_1.z.boolean().optional(),
    is_tax_inclusive: zod_1.z.boolean().optional(),
    payment_providers: zod_1.z.array(zod_1.z.string()).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
exports.AdminUpdateRegion = zod_1.z
    .object({
    name: zod_1.z.string().optional(),
    currency_code: zod_1.z.string().optional(),
    countries: zod_1.z.array(zod_1.z.string()).optional(),
    automatic_taxes: zod_1.z.boolean().optional(),
    is_tax_inclusive: zod_1.z.boolean().optional(),
    payment_providers: zod_1.z.array(zod_1.z.string()).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
//# sourceMappingURL=validators.js.map