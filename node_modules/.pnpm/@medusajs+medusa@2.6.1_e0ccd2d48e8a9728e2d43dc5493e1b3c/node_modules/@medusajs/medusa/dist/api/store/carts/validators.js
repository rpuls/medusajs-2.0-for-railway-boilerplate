"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreUpdateCartCustomer = exports.StoreCreateCartPaymentCollection = exports.StoreAddCartShippingMethods = exports.StoreUpdateCartLineItem = exports.StoreAddCartLineItem = exports.StoreCalculateCartTaxes = exports.StoreUpdateCart = exports.UpdateCart = exports.StoreRemoveCartPromotions = exports.StoreAddCartPromotions = exports.StoreCreateCart = exports.CreateCart = exports.StoreGetCartsCart = void 0;
const zod_1 = require("zod");
const common_validators_1 = require("../../utils/common-validators");
const validators_1 = require("../../utils/validators");
exports.StoreGetCartsCart = (0, validators_1.createSelectParams)();
const ItemSchema = zod_1.z.object({
    variant_id: zod_1.z.string(),
    quantity: zod_1.z.number(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.CreateCart = zod_1.z
    .object({
    region_id: zod_1.z.string().nullish(),
    shipping_address: zod_1.z.union([common_validators_1.AddressPayload, zod_1.z.string()]).optional(),
    billing_address: zod_1.z.union([common_validators_1.AddressPayload, zod_1.z.string()]).optional(),
    email: zod_1.z.string().email().nullish(),
    currency_code: zod_1.z.string().nullish(),
    items: zod_1.z.array(ItemSchema).optional(),
    sales_channel_id: zod_1.z.string().nullish(),
    promo_codes: zod_1.z.array(zod_1.z.string()).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
})
    .strict();
exports.StoreCreateCart = (0, validators_1.WithAdditionalData)(exports.CreateCart);
exports.StoreAddCartPromotions = zod_1.z
    .object({
    promo_codes: zod_1.z.array(zod_1.z.string()),
})
    .strict();
exports.StoreRemoveCartPromotions = zod_1.z
    .object({
    promo_codes: zod_1.z.array(zod_1.z.string()),
})
    .strict();
exports.UpdateCart = zod_1.z
    .object({
    region_id: zod_1.z.string().optional(),
    email: zod_1.z.string().email().nullish(),
    billing_address: zod_1.z.union([common_validators_1.AddressPayload, zod_1.z.string()]).optional(),
    shipping_address: zod_1.z.union([common_validators_1.AddressPayload, zod_1.z.string()]).optional(),
    sales_channel_id: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
    promo_codes: zod_1.z.array(zod_1.z.string()).optional(),
})
    .strict();
exports.StoreUpdateCart = (0, validators_1.WithAdditionalData)(exports.UpdateCart);
exports.StoreCalculateCartTaxes = (0, validators_1.createSelectParams)();
exports.StoreAddCartLineItem = zod_1.z.object({
    variant_id: zod_1.z.string(),
    quantity: zod_1.z.number(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.StoreUpdateCartLineItem = zod_1.z.object({
    quantity: zod_1.z.number(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.StoreAddCartShippingMethods = zod_1.z
    .object({
    option_id: zod_1.z.string(),
    data: zod_1.z.record(zod_1.z.unknown()).optional(),
})
    .strict();
exports.StoreCreateCartPaymentCollection = zod_1.z.object({}).strict();
exports.StoreUpdateCartCustomer = zod_1.z.object({}).strict();
//# sourceMappingURL=validators.js.map