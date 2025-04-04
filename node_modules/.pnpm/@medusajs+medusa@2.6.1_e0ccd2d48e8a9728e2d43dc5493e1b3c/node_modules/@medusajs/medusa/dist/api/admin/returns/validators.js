"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPostReturnsConfirmRequestReqSchema = exports.AdminPostReturnsDismissItemsActionReqSchema = exports.AdminPostReturnsReceiveItemsActionReqSchema = exports.AdminPostReturnsRequestItemsActionReqSchema = exports.AdminPostReturnsReceiveItemsReqSchema = exports.AdminPostReturnsRequestItemsReqSchema = exports.AdminPostReturnsShippingActionReqSchema = exports.AdminPostReturnsShippingReqSchema = exports.AdminPostCancelReturnReqSchema = exports.AdminPostReceiveReturnItemsReqSchema = exports.AdminPostReceiveReturnsReqSchema = exports.AdminPostOrderExchangesReqSchema = exports.AdminPostReturnsReturnReqSchema = exports.AdminPostReturnsReqSchema = exports.AdminGetOrdersParams = exports.AdminGetOrdersOrderParams = void 0;
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
exports.AdminPostReturnsReqSchema = zod_1.z.object({
    order_id: zod_1.z.string(),
    location_id: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    internal_note: zod_1.z.string().optional(),
    no_notification: zod_1.z.boolean().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.AdminPostReturnsReturnReqSchema = zod_1.z.object({
    location_id: zod_1.z.string().optional(),
    no_notification: zod_1.z.boolean().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.AdminPostOrderExchangesReqSchema = zod_1.z.object({
    order_id: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    internal_note: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.AdminPostReceiveReturnsReqSchema = zod_1.z.object({
    internal_note: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
const ReceiveItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    quantity: zod_1.z.number().min(1),
    internal_note: zod_1.z.string().optional(),
});
exports.AdminPostReceiveReturnItemsReqSchema = zod_1.z.object({
    items: zod_1.z.array(ReceiveItemSchema),
});
exports.AdminPostCancelReturnReqSchema = zod_1.z.object({
    no_notification: zod_1.z.boolean().optional(),
});
exports.AdminPostReturnsShippingReqSchema = zod_1.z.object({
    shipping_option_id: zod_1.z.string(),
    custom_amount: zod_1.z.number().optional(),
    description: zod_1.z.string().optional(),
    internal_note: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.AdminPostReturnsShippingActionReqSchema = zod_1.z.object({
    custom_amount: zod_1.z.number().nullish().optional(),
    internal_note: zod_1.z.string().nullish().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish().optional(),
});
exports.AdminPostReturnsRequestItemsReqSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        quantity: zod_1.z.number(),
        description: zod_1.z.string().optional(),
        internal_note: zod_1.z.string().optional(),
        reason_id: zod_1.z.string().optional(),
        metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    })),
});
exports.AdminPostReturnsReceiveItemsReqSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        quantity: zod_1.z.number(),
        description: zod_1.z.string().optional(),
        internal_note: zod_1.z.string().optional(),
    })),
});
exports.AdminPostReturnsRequestItemsActionReqSchema = zod_1.z.object({
    quantity: zod_1.z.number().optional(),
    internal_note: zod_1.z.string().nullish().optional(),
    reason_id: zod_1.z.string().nullish().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish().optional(),
});
exports.AdminPostReturnsReceiveItemsActionReqSchema = zod_1.z.object({
    quantity: zod_1.z.number().optional(),
    internal_note: zod_1.z.string().nullish().optional(),
});
exports.AdminPostReturnsDismissItemsActionReqSchema = zod_1.z.object({
    quantity: zod_1.z.number().optional(),
    internal_note: zod_1.z.string().nullish().optional(),
});
exports.AdminPostReturnsConfirmRequestReqSchema = zod_1.z.object({
    no_notification: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=validators.js.map