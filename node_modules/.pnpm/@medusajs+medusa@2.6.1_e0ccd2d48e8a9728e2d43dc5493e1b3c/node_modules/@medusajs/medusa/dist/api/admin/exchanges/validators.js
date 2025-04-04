"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPostExchangesItemsActionReqSchema = exports.AdminPostExchangesConfirmRequestReqSchema = exports.AdminPostExchangesDismissItemsActionReqSchema = exports.AdminPostExchangesReturnRequestItemsReqSchema = exports.AdminPostExchangesAddItemsReqSchema = exports.AdminPostExchangesShippingActionReqSchema = exports.AdminPostExchangesShippingReqSchema = exports.AdminPostExchangesRequestItemsReturnActionReqSchema = exports.AdminPostCancelExchangeReqSchema = exports.AdminPostReceiveExchangeItemsReqSchema = exports.AdminPostReceiveExchangesReqSchema = exports.AdminPostOrderExchangesReqSchema = exports.AdminGetOrdersParams = exports.AdminGetOrdersOrderParams = void 0;
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
exports.AdminGetOrdersOrderParams = (0, validators_1.createSelectParams)().merge(zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    status: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
}));
/**
 * Parameters used to filter and configure the pagination of the retrieved order.
 */
exports.AdminGetOrdersParams = (0, validators_1.createFindParams)({
    limit: 15,
    offset: 0,
}).merge(zod_1.z.object({
    id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    order_id: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    status: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    created_at: (0, validators_1.createOperatorMap)().optional(),
    updated_at: (0, validators_1.createOperatorMap)().optional(),
    deleted_at: (0, validators_1.createOperatorMap)().optional(),
}));
exports.AdminPostOrderExchangesReqSchema = zod_1.z.object({
    order_id: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    internal_note: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.AdminPostReceiveExchangesReqSchema = zod_1.z.object({
    internal_note: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
const ReceiveItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    quantity: zod_1.z.number().min(1),
    internal_note: zod_1.z.string().optional(),
});
exports.AdminPostReceiveExchangeItemsReqSchema = zod_1.z.object({
    items: zod_1.z.array(ReceiveItemSchema),
});
exports.AdminPostCancelExchangeReqSchema = zod_1.z.object({
    no_notification: zod_1.z.boolean().optional(),
});
exports.AdminPostExchangesRequestItemsReturnActionReqSchema = zod_1.z.object({
    quantity: zod_1.z.number().optional(),
    internal_note: zod_1.z.string().nullish().optional(),
    reason_id: zod_1.z.string().nullish().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish().optional(),
});
exports.AdminPostExchangesShippingReqSchema = zod_1.z.object({
    shipping_option_id: zod_1.z.string(),
    custom_amount: zod_1.z.number().optional(),
    description: zod_1.z.string().optional(),
    internal_note: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.AdminPostExchangesShippingActionReqSchema = zod_1.z.object({
    custom_amount: zod_1.z.number().nullish().optional(),
    internal_note: zod_1.z.string().nullish().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish().optional(),
});
exports.AdminPostExchangesAddItemsReqSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        variant_id: zod_1.z.string(),
        quantity: zod_1.z.number(),
        unit_price: zod_1.z.number().optional(),
        internal_note: zod_1.z.string().optional(),
        allow_backorder: zod_1.z.boolean().optional(),
        metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    })),
});
exports.AdminPostExchangesReturnRequestItemsReqSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        quantity: zod_1.z.number(),
        description: zod_1.z.string().optional(),
        internal_note: zod_1.z.string().optional(),
        reason_id: zod_1.z.string().optional(),
        metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    })),
});
exports.AdminPostExchangesDismissItemsActionReqSchema = zod_1.z.object({
    quantity: zod_1.z.number().optional(),
    internal_note: zod_1.z.string().nullish().optional(),
});
exports.AdminPostExchangesConfirmRequestReqSchema = zod_1.z.object({
    no_notification: zod_1.z.boolean().optional(),
});
exports.AdminPostExchangesItemsActionReqSchema = zod_1.z.object({
    quantity: zod_1.z.number().optional(),
    internal_note: zod_1.z.string().nullish().optional(),
});
//# sourceMappingURL=validators.js.map