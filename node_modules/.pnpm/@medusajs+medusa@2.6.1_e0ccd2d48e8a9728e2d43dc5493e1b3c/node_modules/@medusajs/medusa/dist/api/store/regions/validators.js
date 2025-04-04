"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreGetRegionsParams = exports.StoreGetRegionsParamsFields = exports.StoreGetRegionParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.StoreGetRegionParams = (0, validators_1.createSelectParams)();
exports.StoreGetRegionsParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    currency_code: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    name: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
});
exports.StoreGetRegionsParams = (0, validators_1.createFindParams)({
    limit: 50,
    offset: 0,
})
    .merge(exports.StoreGetRegionsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.StoreGetRegionsParamsFields));
//# sourceMappingURL=validators.js.map