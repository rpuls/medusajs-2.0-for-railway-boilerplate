"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPostClaimsConfirmRequestReqSchema = exports.AdminPostClaimsDismissItemsActionReqSchema = exports.AdminPostClaimsItemsActionReqSchema = exports.AdminPostClaimsRequestItemsActionReqSchema = exports.AdminPostClaimItemsReqSchema = exports.AdminPostClaimsRequestItemsReturnActionReqSchema = exports.AdminPostClaimsRequestReturnItemsReqSchema = exports.AdminPostClaimsAddItemsReqSchema = exports.AdminPostClaimsShippingActionReqSchema = exports.AdminPostClaimsShippingReqSchema = exports.AdminPostCancelClaimReqSchema = exports.AdminPostReceiveClaimItemsReqSchema = exports.AdminPostReceiveClaimsReqSchema = exports.AdminPostOrderExchangesReqSchema = exports.AdminPostOrderClaimsReqSchema = exports.AdminGetOrdersParams = exports.AdminGetOrdersOrderParams = void 0;
const utils_1 = require("@medusajs/framework/utils");
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
exports.AdminPostOrderClaimsReqSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(utils_1.ClaimType),
    order_id: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    internal_note: zod_1.z.string().optional(),
    reason_id: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.AdminPostOrderExchangesReqSchema = zod_1.z.object({
    order_id: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    internal_note: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
exports.AdminPostReceiveClaimsReqSchema = zod_1.z.object({
    internal_note: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish(),
});
const ReceiveItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    quantity: zod_1.z.number().min(1),
    internal_note: zod_1.z.string().optional(),
});
exports.AdminPostReceiveClaimItemsReqSchema = zod_1.z.object({
    items: zod_1.z.array(ReceiveItemSchema),
});
exports.AdminPostCancelClaimReqSchema = zod_1.z.object({
    no_notification: zod_1.z.boolean().optional(),
});
exports.AdminPostClaimsShippingReqSchema = zod_1.z.object({
    shipping_option_id: zod_1.z.string(),
    custom_amount: zod_1.z.number().optional(),
    description: zod_1.z.string().optional(),
    internal_note: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.AdminPostClaimsShippingActionReqSchema = zod_1.z.object({
    custom_amount: zod_1.z.number().nullish().optional(),
    internal_note: zod_1.z.string().nullish().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish().optional(),
});
exports.AdminPostClaimsAddItemsReqSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        variant_id: zod_1.z.string(),
        quantity: zod_1.z.number(),
        unit_price: zod_1.z.number().optional(),
        internal_note: zod_1.z.string().optional(),
        metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    })),
});
exports.AdminPostClaimsRequestReturnItemsReqSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        quantity: zod_1.z.number(),
        description: zod_1.z.string().optional(),
        internal_note: zod_1.z.string().optional(),
        reason_id: zod_1.z.string().optional(),
        metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    })),
});
exports.AdminPostClaimsRequestItemsReturnActionReqSchema = zod_1.z.object({
    quantity: zod_1.z.number().optional(),
    internal_note: zod_1.z.string().nullish().optional(),
    reason_id: zod_1.z.string().nullish().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish().optional(),
});
exports.AdminPostClaimItemsReqSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        quantity: zod_1.z.number(),
        reason: zod_1.z.nativeEnum(utils_1.ClaimReason).optional(),
        description: zod_1.z.string().optional(),
        internal_note: zod_1.z.string().optional(),
    })),
});
exports.AdminPostClaimsRequestItemsActionReqSchema = zod_1.z.object({
    quantity: zod_1.z.number().optional(),
    internal_note: zod_1.z.string().nullish().optional(),
    reason_id: zod_1.z.string().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullish().optional(),
});
exports.AdminPostClaimsItemsActionReqSchema = zod_1.z.object({
    quantity: zod_1.z.number().optional(),
    reason_id: zod_1.z.string().nullish(),
    internal_note: zod_1.z.string().nullish().optional(),
});
exports.AdminPostClaimsDismissItemsActionReqSchema = zod_1.z.object({
    quantity: zod_1.z.number().optional(),
    internal_note: zod_1.z.string().nullish().optional(),
});
exports.AdminPostClaimsConfirmRequestReqSchema = zod_1.z.object({
    no_notification: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=validators.js.map