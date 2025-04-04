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
export declare const AdminPostReceiveExchangesReqSchema: z.ZodObject<{
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
export type AdminPostReceiveExchangesReqSchemaType = z.infer<typeof AdminPostReceiveExchangesReqSchema>;
export declare const AdminPostReceiveExchangeItemsReqSchema: z.ZodObject<{
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
export type AdminPostReceiveExchangeItemsReqSchemaType = z.infer<typeof AdminPostReceiveExchangeItemsReqSchema>;
export declare const AdminPostCancelExchangeReqSchema: z.ZodObject<{
    no_notification: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    no_notification?: boolean | undefined;
}, {
    no_notification?: boolean | undefined;
}>;
export type AdminPostCancelExchangeReqSchemaType = z.infer<typeof AdminPostCancelExchangeReqSchema>;
export declare const AdminPostExchangesRequestItemsReturnActionReqSchema: z.ZodObject<{
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
export type AdminPostExchangesRequestItemsReturnActionReqSchemaType = z.infer<typeof AdminPostExchangesRequestItemsReturnActionReqSchema>;
export declare const AdminPostExchangesShippingReqSchema: z.ZodObject<{
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
export type AdminPostExchangesShippingReqSchemaType = z.infer<typeof AdminPostExchangesShippingReqSchema>;
export declare const AdminPostExchangesShippingActionReqSchema: z.ZodObject<{
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
export type AdminPostExchangesShippingActionReqSchemaType = z.infer<typeof AdminPostExchangesShippingActionReqSchema>;
export declare const AdminPostExchangesAddItemsReqSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        variant_id: z.ZodString;
        quantity: z.ZodNumber;
        unit_price: z.ZodOptional<z.ZodNumber>;
        internal_note: z.ZodOptional<z.ZodString>;
        allow_backorder: z.ZodOptional<z.ZodBoolean>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        variant_id: string;
        unit_price?: number | undefined;
        internal_note?: string | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        quantity: number;
        variant_id: string;
        unit_price?: number | undefined;
        internal_note?: string | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        quantity: number;
        variant_id: string;
        unit_price?: number | undefined;
        internal_note?: string | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
}, {
    items: {
        quantity: number;
        variant_id: string;
        unit_price?: number | undefined;
        internal_note?: string | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
}>;
export type AdminPostExchangesAddItemsReqSchemaType = z.infer<typeof AdminPostExchangesAddItemsReqSchema>;
export declare const AdminPostExchangesReturnRequestItemsReqSchema: z.ZodObject<{
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
export type AdminPostExchangesReturnRequestItemsReqSchemaType = z.infer<typeof AdminPostExchangesReturnRequestItemsReqSchema>;
export declare const AdminPostExchangesDismissItemsActionReqSchema: z.ZodObject<{
    quantity: z.ZodOptional<z.ZodNumber>;
    internal_note: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    quantity?: number | undefined;
    internal_note?: string | null | undefined;
}, {
    quantity?: number | undefined;
    internal_note?: string | null | undefined;
}>;
export type AdminPostExchangesDismissItemsActionReqSchemaType = z.infer<typeof AdminPostExchangesDismissItemsActionReqSchema>;
export declare const AdminPostExchangesConfirmRequestReqSchema: z.ZodObject<{
    no_notification: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    no_notification?: boolean | undefined;
}, {
    no_notification?: boolean | undefined;
}>;
export type AdminPostExchangesConfirmRequestReqSchemaType = z.infer<typeof AdminPostExchangesConfirmRequestReqSchema>;
export declare const AdminPostExchangesItemsActionReqSchema: z.ZodObject<{
    quantity: z.ZodOptional<z.ZodNumber>;
    internal_note: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    quantity?: number | undefined;
    internal_note?: string | null | undefined;
}, {
    quantity?: number | undefined;
    internal_note?: string | null | undefined;
}>;
export type AdminPostExchangesItemsActionReqSchemaType = z.infer<typeof AdminPostExchangesItemsActionReqSchema>;
//# sourceMappingURL=validators.d.ts.map