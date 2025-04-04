"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminFulfillmentProvidersParams = void 0;
const zod_1 = require("zod");
const common_validators_1 = require("../../utils/common-validators");
const validators_1 = require("../../utils/validators");
exports.AdminFulfillmentProvidersParams = (0, validators_1.createFindParams)({
    limit: 50,
    offset: 0,
})
    .merge(zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    stock_location_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    is_enabled: (0, common_validators_1.booleanString)().optional(),
    q: zod_1.z.string().optional(),
}))
    .strict();
//# sourceMappingURL=validators.js.map