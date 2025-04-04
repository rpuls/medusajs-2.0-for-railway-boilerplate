"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformProductParams = exports.GetProductsParams = exports.StoreGetProductParamsDirectFields = exports.ProductStatusEnum = void 0;
const utils_1 = require("@medusajs/framework/utils");
const zod_1 = require("zod");
const validators_1 = require("../../validators");
const common_1 = require("../common");
exports.ProductStatusEnum = zod_1.z.nativeEnum(utils_1.ProductStatus);
exports.StoreGetProductParamsDirectFields = zod_1.z.object({
    q: zod_1.z.string().optional(),
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    title: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    handle: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    is_giftcard: (0, common_1.booleanString)().optional(),
    category_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    external_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    collection_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    tag_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    type_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
});
exports.GetProductsParams = zod_1.z
    .object({
    sales_channel_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
})
    .merge(exports.StoreGetProductParamsDirectFields);
const transformProductParams = (data) => {
    const res = {
        ...data,
    };
    if ((0, utils_1.isPresent)(data.tag_id)) {
        res.tags = { id: data.tag_id };
        delete res.tag_id;
    }
    if ((0, utils_1.isPresent)(data.category_id)) {
        res.categories = { id: data.category_id };
        delete res.category_id;
    }
    return res;
};
exports.transformProductParams = transformProductParams;
//# sourceMappingURL=index.js.map