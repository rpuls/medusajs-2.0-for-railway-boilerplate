"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreGetCurrenciesParams = exports.StoreGetCurrenciesParamsFields = exports.StoreGetCurrencyParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.StoreGetCurrencyParams = (0, validators_1.createSelectParams)();
exports.StoreGetCurrenciesParamsFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    code: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
});
exports.StoreGetCurrenciesParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 50,
})
    .merge(exports.StoreGetCurrenciesParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.StoreGetCurrenciesParamsFields));
//# sourceMappingURL=validators.js.map