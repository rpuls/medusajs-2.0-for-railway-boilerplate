"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdatePricePreference = exports.AdminCreatePricePreference = exports.AdminGetPricePreferencesParams = exports.AdminGetPricePreferencesParamsFields = exports.AdminGetPricePreferenceParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.AdminGetPricePreferenceParams = (0, validators_1.createSelectParams)();
exports.AdminGetPricePreferencesParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    attribute: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
});
exports.AdminGetPricePreferencesParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 300,
})
    .merge(exports.AdminGetPricePreferencesParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetPricePreferencesParamsFields));
exports.AdminCreatePricePreference = zod_1.z.object({
    attribute: zod_1.z.string(),
    value: zod_1.z.string(),
    is_tax_inclusive: zod_1.z.boolean().optional(),
});
exports.AdminUpdatePricePreference = zod_1.z.object({
    attribute: zod_1.z.string().optional(),
    value: zod_1.z.string().optional(),
    is_tax_inclusive: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=validators.js.map