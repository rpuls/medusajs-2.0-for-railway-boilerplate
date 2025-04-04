import { ClaimReason, ClaimType } from "@medusajs/framework/utils";
import { z } from "zod";
export declare const AdminGetOrdersOrderParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    status: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    created_at: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
        $eq: any;
        $ne: any;
        $in: any;
        $nin: any;
        $like: any;
        $ilike: any;
        $re: any;
        $contains: any;
        $gt: any;
        $gte: any;
        $lt: any;
        $lte: any;
    }, "strip", z.ZodTypeAny, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }>]>>;
    updated_at: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
        $eq: any;
        $ne: any;
        $in: any;
        $nin: any;
        $like: any;
        $ilike: any;
        $re: any;
        $contains: any;
        $gt: any;
        $gte: any;
        $lt: any;
        $lte: any;
    }, "strip", z.ZodTypeAny, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }>]>>;
    deleted_at: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
        $eq: any;
        $ne: any;
        $in: any;
        $nin: any;
        $like: any;
        $ilike: any;
        $re: any;
        $contains: any;
        $gt: any;
        $gte: any;
        $lt: any;
        $lte: any;
    }, "strip", z.ZodTypeAny, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }>]>>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
    id?: string | string[] | undefined;
    status?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}, {
    fields?: string | undefined;
    id?: string | string[] | undefined;
    status?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}>;
export type AdminGetOrdersOrderParamsType = z.infer<typeof AdminGetOrdersOrderParams>;
/**
 * Parameters used to filter and configure the pagination of the retrieved order.
 */
export declare const AdminGetOrdersParams: z.ZodObject<{
    order: z.ZodOptional<z.ZodString> | z.ZodDefault<z.ZodOptional<z.ZodString>>;
    fields: z.ZodOptional<z.ZodString>;
    offset: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodNumber>>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodNumber>>, number, unknown>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    order_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    status: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    created_at: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
        $eq: any;
        $ne: any;
        $in: any;
        $nin: any;
        $like: any;
        $ilike: any;
        $re: any;
        $contains: any;
        $gt: any;
        $gte: any;
        $lt: any;
        $lte: any;
    }, "strip", z.ZodTypeAny, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }>]>>;
    updated_at: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
        $eq: any;
        $ne: any;
        $in: any;
        $nin: any;
        $like: any;
        $ilike: any;
        $re: any;
        $contains: any;
        $gt: any;
        $gte: any;
        $lt: any;
        $lte: any;
    }, "strip", z.ZodTypeAny, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }>]>>;
    deleted_at: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
        $eq: any;
        $ne: any;
        $in: any;
        $nin: any;
        $like: any;
        $ilike: any;
        $re: any;
        $contains: any;
        $gt: any;
        $gte: any;
        $lt: any;
        $lte: any;
    }, "strip", z.ZodTypeAny, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }, {
        $eq?: any;
        $ne?: any;
        $in?: any;
        $nin?: any;
        $like?: any;
        $ilike?: any;
        $re?: any;
        $contains?: any;
        $gt?: any;
        $gte?: any;
        $lt?: any;
        $lte?: any;
    }>]>>;
}, "strip", z.ZodTypeAny, {
    offset: number;
    limit: number;
    order?: string | undefined;
    fields?: string | undefined;
    id?: string | string[] | undefined;
    order_id?: string | string[] | undefined;
    status?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}, {
    order?: string | undefined;
    fields?: string | undefined;
    offset?: unknown;
    limit?: unknown;
    id?: string | string[] | undefined;
    order_id?: string | string[] | undefined;
    status?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}>;
export type AdminGetOrdersParamsType = z.infer<typeof AdminGetOrdersParams>;
export declare const AdminPostOrderClaimsReqSchema: z.ZodObject<{
    type: z.ZodNativeEnum<typeof ClaimType>;
    order_id: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    internal_note: z.ZodOptional<z.ZodString>;
    reason_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    type: ClaimType;
    order_id: string;
    description?: string | undefined;
    internal_note?: string | undefined;
    reason_id?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    type: ClaimType;
    order_id: string;
    description?: string | undefined;
    internal_note?: string | undefined;
    reason_id?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type AdminPostOrderClaimsReqSchemaType = z.infer<typeof AdminPostOrderClaimsReqSchema>;
export declare const AdminPostOrderExchangesReqSchema: z.ZodObject<{
    order_id: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    internal_note: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    order_id: string;
    description?: string | undefined;
    internal_note?: string | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    order_id: string;
    description?: string | undefined;
    internal_note?: string | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type AdminPostOrderExchangesReqSchemaType = z.infer<typeof AdminPostOrderExchangesReqSchema>;
export declare const AdminPostReceiveClaimsReqSchema: z.ZodObject<{
    internal_note: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    internal_note?: string | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    internal_note?: string | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type AdminPostReceiveClaimsReqSchemaType = z.infer<typeof AdminPostReceiveClaimsReqSchema>;
export declare const AdminPostReceiveClaimItemsReqSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        quantity: z.ZodNumber;
        internal_note: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        quantity: number;
        internal_note?: string | undefined;
    }, {
        id: string;
        quantity: number;
        internal_note?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        id: string;
        quantity: number;
        internal_note?: string | undefined;
    }[];
}, {
    items: {
        id: string;
        quantity: number;
        internal_note?: string | undefined;
    }[];
}>;
export type AdminPostReceiveClaimItemsReqSchemaType = z.infer<typeof AdminPostReceiveClaimItemsReqSchema>;
export declare const AdminPostCancelClaimReqSchema: z.ZodObject<{
    no_notification: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    no_notification?: boolean | undefined;
}, {
    no_notification?: boolean | undefined;
}>;
export type AdminPostCancelClaimReqSchemaType = z.infer<typeof AdminPostCancelClaimReqSchema>;
export declare const AdminPostClaimsShippingReqSchema: z.ZodObject<{
    shipping_option_id: z.ZodString;
    custom_amount: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
    internal_note: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    shipping_option_id: string;
    custom_amount?: number | undefined;
    description?: string | undefined;
    internal_note?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    shipping_option_id: string;
    custom_amount?: number | undefined;
    description?: string | undefined;
    internal_note?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export type AdminPostClaimsShippingReqSchemaType = z.infer<typeof AdminPostClaimsShippingReqSchema>;
export declare const AdminPostClaimsShippingActionReqSchema: z.ZodObject<{
    custom_amount: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodNumber>>>;
    internal_note: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>>;
}, "strip", z.ZodTypeAny, {
    custom_amount?: number | null | undefined;
    internal_note?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    custom_amount?: number | null | undefined;
    internal_note?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type AdminPostClaimsShippingActionReqSchemaType = z.infer<typeof AdminPostClaimsShippingActionReqSchema>;
export declare const AdminPostClaimsAddItemsReqSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        variant_id: z.ZodString;
        quantity: z.ZodNumber;
        unit_price: z.ZodOptional<z.ZodNumber>;
        internal_note: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        variant_id: string;
        unit_price?: number | undefined;
        internal_note?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        quantity: number;
        variant_id: string;
        unit_price?: number | undefined;
        internal_note?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        quantity: number;
        variant_id: string;
        unit_price?: number | undefined;
        internal_note?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
}, {
    items: {
        quantity: number;
        variant_id: string;
        unit_price?: number | undefined;
        internal_note?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
}>;
export type AdminPostClaimsAddItemsReqSchemaType = z.infer<typeof AdminPostClaimsAddItemsReqSchema>;
export declare const AdminPostClaimsRequestReturnItemsReqSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        quantity: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
        internal_note: z.ZodOptional<z.ZodString>;
        reason_id: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        quantity: number;
        description?: string | undefined;
        internal_note?: string | undefined;
        reason_id?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        id: string;
        quantity: number;
        description?: string | undefined;
        internal_note?: string | undefined;
        reason_id?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        id: string;
        quantity: number;
        description?: string | undefined;
        internal_note?: string | undefined;
        reason_id?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
}, {
    items: {
        id: string;
        quantity: number;
        description?: string | undefined;
        internal_note?: string | undefined;
        reason_id?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
}>;
export type AdminPostClaimsRequestReturnItemsReqSchemaType = z.infer<typeof AdminPostClaimsRequestReturnItemsReqSchema>;
export declare const AdminPostClaimsRequestItemsReturnActionReqSchema: z.ZodObject<{
    quantity: z.ZodOptional<z.ZodNumber>;
    internal_note: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    reason_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>>;
}, "strip", z.ZodTypeAny, {
    quantity?: number | undefined;
    internal_note?: string | null | undefined;
    reason_id?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    quantity?: number | undefined;
    internal_note?: string | null | undefined;
    reason_id?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type AdminPostClaimsRequestItemsReturnActionReqSchemaType = z.infer<typeof AdminPostClaimsRequestItemsReturnActionReqSchema>;
export declare const AdminPostClaimItemsReqSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        quantity: z.ZodNumber;
        reason: z.ZodOptional<z.ZodNativeEnum<typeof ClaimReason>>;
        description: z.ZodOptional<z.ZodString>;
        internal_note: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        quantity: number;
        reason?: ClaimReason | undefined;
        description?: string | undefined;
        internal_note?: string | undefined;
    }, {
        id: string;
        quantity: number;
        reason?: ClaimReason | undefined;
        description?: string | undefined;
        internal_note?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        id: string;
        quantity: number;
        reason?: ClaimReason | undefined;
        description?: string | undefined;
        internal_note?: string | undefined;
    }[];
}, {
    items: {
        id: string;
        quantity: number;
        reason?: ClaimReason | undefined;
        description?: string | undefined;
        internal_note?: string | undefined;
    }[];
}>;
export type AdminPostClaimItemsReqSchemaType = z.infer<typeof AdminPostClaimItemsReqSchema>;
export declare const AdminPostClaimsRequestItemsActionReqSchema: z.ZodObject<{
    quantity: z.ZodOptional<z.ZodNumber>;
    internal_note: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    reason_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>>;
}, "strip", z.ZodTypeAny, {
    quantity?: number | undefined;
    internal_note?: string | null | undefined;
    reason_id?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    quantity?: number | undefined;
    internal_note?: string | null | undefined;
    reason_id?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type AdminPostClaimsRequestItemsActionReqSchemaType = z.infer<typeof AdminPostClaimsRequestItemsActionReqSchema>;
export declare const AdminPostClaimsItemsActionReqSchema: z.ZodObject<{
    quantity: z.ZodOptional<z.ZodNumber>;
    reason_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    internal_note: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    quantity?: number | undefined;
    reason_id?: string | null | undefined;
    internal_note?: string | null | undefined;
}, {
    quantity?: number | undefined;
    reason_id?: string | null | undefined;
    internal_note?: string | null | undefined;
}>;
export type AdminPostClaimsItemsActionReqSchemaType = z.infer<typeof AdminPostClaimsItemsActionReqSchema>;
export declare const AdminPostClaimsDismissItemsActionReqSchema: z.ZodObject<{
    quantity: z.ZodOptional<z.ZodNumber>;
    internal_note: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    quantity?: number | undefined;
    internal_note?: string | null | undefined;
}, {
    quantity?: number | undefined;
    internal_note?: string | null | undefined;
}>;
export type AdminPostClaimsDismissItemsActionReqSchemaType = z.infer<typeof AdminPostClaimsDismissItemsActionReqSchema>;
export declare const AdminPostClaimsConfirmRequestReqSchema: z.ZodObject<{
    no_notification: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    no_notification?: boolean | undefined;
}, {
    no_notification?: boolean | undefined;
}>;
export type AdminPostClaimsConfirmRequestReqSchemaType = z.infer<typeof AdminPostClaimsConfirmRequestReqSchema>;
//# sourceMappingURL=validators.d.ts.map