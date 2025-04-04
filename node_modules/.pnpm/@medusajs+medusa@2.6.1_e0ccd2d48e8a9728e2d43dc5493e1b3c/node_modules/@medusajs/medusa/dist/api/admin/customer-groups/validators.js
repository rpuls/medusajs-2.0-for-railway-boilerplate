"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateCustomerGroup = exports.AdminCreateCustomerGroup = exports.AdminGetCustomerGroupsParams = exports.AdminGetCustomerGroupsParamsFields = exports.AdminCustomerInGroupFilters = exports.AdminGetCustomerGroupParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.AdminGetCustomerGroupParams = (0, validators_1.createSelectParams)();
exports.AdminCustomerInGroupFilters = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    email: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string()), (0, validators_1.createOperatorMap)()])
        .optional(),
    default_billing_address_id: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .optional(),
    default_shipping_address_id: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .optional(),
    company_name: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    first_name: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    last_name: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_by: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetCustomerGroupsParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    name: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    customers: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string()), exports.AdminCustomerInGroupFilters])
        .optional(),
    created_by: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.AdminGetCustomerGroupsParams = (0, validators_1.createFindParams)({
    limit: 50,
    offset: 0,
})
    .merge(exports.AdminGetCustomerGroupsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetCustomerGroupsParamsFields));
exports.AdminCreateCustomerGroup = zod_1.z.object({
    name: zod_1.z.string(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.AdminUpdateCustomerGroup = zod_1.z.object({
    name: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
//# sourceMappingURL=validators.js.map