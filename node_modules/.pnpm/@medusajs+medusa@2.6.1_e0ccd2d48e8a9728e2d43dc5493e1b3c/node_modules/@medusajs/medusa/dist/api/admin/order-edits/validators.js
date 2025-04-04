"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPostOrderEditsUpdateItemQuantityReqSchema = exports.AdminPostOrderEditsItemsActionReqSchema = exports.AdminPostOrderEditsAddItemsReqSchema = exports.AdminPostOrderEditsShippingActionReqSchema = exports.AdminPostOrderEditsShippingReqSchema = exports.AdminPostOrderEditsReqSchema = void 0;
const zod_1 = require("zod");
exports.AdminPostOrderEditsReqSchema = zod_1.z.object({
    order_id: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    internal_note: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.AdminPostOrderEditsShippingReqSchema = zod_1.z.object({
    shipping_option_id: zod_1.z.string(),
    custom_amount: zod_1.z.number().optional(),
    description: zod_1.z.string().optional(),
    internal_note: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.AdminPostOrderEditsShippingActionReqSchema = zod_1.z.object({
    custom_amount: zod_1.z.number().nullish().optional(),
    internal_note: zod_1.z.string().nullish().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish().optional(),
});
exports.AdminPostOrderEditsAddItemsReqSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        variant_id: zod_1.z.string(),
        quantity: zod_1.z.number(),
        unit_price: zod_1.z.number().nullish(),
        compare_at_unit_price: zod_1.z.number().nullish(),
        internal_note: zod_1.z.string().nullish(),
        allow_backorder: zod_1.z.boolean().optional(),
        metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    })),
});
exports.AdminPostOrderEditsItemsActionReqSchema = zod_1.z.object({
    quantity: zod_1.z.number().optional(),
    unit_price: zod_1.z.number().nullish(),
    compare_at_unit_price: zod_1.z.number().nullish(),
    internal_note: zod_1.z.string().nullish().optional(),
});
exports.AdminPostOrderEditsUpdateItemQuantityReqSchema = zod_1.z.object({
    quantity: zod_1.z.number(),
    unit_price: zod_1.z.number().nullish(),
    compare_at_unit_price: zod_1.z.number().nullish(),
    internal_note: zod_1.z.string().nullish().optional(),
});
//# sourceMappingURL=validators.js.map