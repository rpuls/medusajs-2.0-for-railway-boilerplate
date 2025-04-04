"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateDraftOrder = exports.AdminCreateDraftOrder = exports.AdminGetDraftOrdersParams = exports.AdminGetDraftOrderParams = void 0;
const zod_1 = require("zod");
const common_validators_1 = require("../../utils/common-validators");
const validators_1 = require("../../utils/validators");
exports.AdminGetDraftOrderParams = (0, validators_1.createSelectParams)();
const AdminGetDraftOrdersParamsFields = zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    q: zod_1.z.string().optional(),
    region_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    sales_channel_id: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.AdminGetDraftOrdersParams = (0, validators_1.createFindParams)({
    limit: 50,
    offset: 0,
})
    .merge(AdminGetDraftOrdersParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(AdminGetDraftOrdersParamsFields));
var Status;
(function (Status) {
    Status["completed"] = "completed";
})(Status || (Status = {}));
const ShippingMethod = zod_1.z.object({
    shipping_method_id: zod_1.z.string().nullish(),
    name: zod_1.z.string(),
    shipping_option_id: zod_1.z.string(),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    amount: common_validators_1.BigNumberInput,
});
const Item = zod_1.z.object({
    title: zod_1.z.string().nullish(),
    variant_sku: zod_1.z.string().nullish(),
    variant_barcode: zod_1.z.string().nullish(),
    /**
     * Use variant_sku instead
     * @deprecated
     */
    sku: zod_1.z.string().nullish(),
    /**
     * Use variant_barcode instead
     * @deprecated
     */
    barcode: zod_1.z.string().nullish(),
    variant_id: zod_1.z.string().nullish(),
    unit_price: common_validators_1.BigNumberInput.nullish(),
    quantity: zod_1.z.number(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
const CreateDraftOrder = zod_1.z
    .object({
    status: zod_1.z.nativeEnum(Status).optional(),
    sales_channel_id: zod_1.z.string().nullish(),
    email: zod_1.z.string().nullish(),
    customer_id: zod_1.z.string().nullish(),
    billing_address: zod_1.z.union([common_validators_1.AddressPayload, zod_1.z.string()]).optional(),
    shipping_address: zod_1.z.union([common_validators_1.AddressPayload, zod_1.z.string()]).optional(),
    items: zod_1.z.array(Item).optional(),
    region_id: zod_1.z.string(),
    promo_codes: zod_1.z.array(zod_1.z.string()).optional(),
    currency_code: zod_1.z.string().nullish(),
    no_notification_order: zod_1.z.boolean().optional(),
    shipping_methods: zod_1.z.array(ShippingMethod).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
exports.AdminCreateDraftOrder = (0, validators_1.WithAdditionalData)(CreateDraftOrder, (schema) => {
    return schema.refine((data) => {
        if (!data.email && !data.customer_id) {
            return false;
        }
        return true;
    }, { message: "Either email or customer_id must be provided" });
});
exports.AdminUpdateDraftOrder = zod_1.z.object({
    email: zod_1.z.string().optional(),
    shipping_address: common_validators_1.AddressPayload.optional(),
    billing_address: common_validators_1.AddressPayload.optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
//# sourceMappingURL=validators.js.map