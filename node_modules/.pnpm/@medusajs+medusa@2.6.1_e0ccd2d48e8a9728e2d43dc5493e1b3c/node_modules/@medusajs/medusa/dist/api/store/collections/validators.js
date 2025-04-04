"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreGetCollectionsParams = exports.StoreGetCollectionsParamsFields = exports.StoreGetCollectionParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.StoreGetCollectionParams = (0, validators_1.createSelectParams)();
exports.StoreGetCollectionsParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    title: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    handle: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.StoreGetCollectionsParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 10,
    order: "-created_at",
})
    .merge(exports.StoreGetCollectionsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.StoreGetCollectionsParamsFields));
//# sourceMappingURL=validators.js.map