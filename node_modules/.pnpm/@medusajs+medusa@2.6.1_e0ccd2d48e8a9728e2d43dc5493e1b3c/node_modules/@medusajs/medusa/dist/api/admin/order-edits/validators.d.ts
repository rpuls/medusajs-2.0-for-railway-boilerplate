import { z } from "zod";
export declare const AdminPostOrderEditsReqSchema: z.ZodObject<{
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
export type AdminPostOrderEditsReqSchemaType = z.infer<typeof AdminPostOrderEditsReqSchema>;
export declare const AdminPostOrderEditsShippingReqSchema: z.ZodObject<{
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
export type AdminPostOrderEditsShippingReqSchemaType = z.infer<typeof AdminPostOrderEditsShippingReqSchema>;
export declare const AdminPostOrderEditsShippingActionReqSchema: z.ZodObject<{
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
export type AdminPostOrderEditsShippingActionReqSchemaType = z.infer<typeof AdminPostOrderEditsShippingActionReqSchema>;
export declare const AdminPostOrderEditsAddItemsReqSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        variant_id: z.ZodString;
        quantity: z.ZodNumber;
        unit_price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        compare_at_unit_price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        internal_note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        allow_backorder: z.ZodOptional<z.ZodBoolean>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        variant_id: string;
        unit_price?: number | null | undefined;
        compare_at_unit_price?: number | null | undefined;
        internal_note?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }, {
        quantity: number;
        variant_id: string;
        unit_price?: number | null | undefined;
        compare_at_unit_price?: number | null | undefined;
        internal_note?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        quantity: number;
        variant_id: string;
        unit_price?: number | null | undefined;
        compare_at_unit_price?: number | null | undefined;
        internal_note?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
}, {
    items: {
        quantity: number;
        variant_id: string;
        unit_price?: number | null | undefined;
        compare_at_unit_price?: number | null | undefined;
        internal_note?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
}>;
export type AdminPostOrderEditsAddItemsReqSchemaType = z.infer<typeof AdminPostOrderEditsAddItemsReqSchema>;
export declare const AdminPostOrderEditsItemsActionReqSchema: z.ZodObject<{
    quantity: z.ZodOptional<z.ZodNumber>;
    unit_price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    compare_at_unit_price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    internal_note: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    quantity?: number | undefined;
    unit_price?: number | null | undefined;
    compare_at_unit_price?: number | null | undefined;
    internal_note?: string | null | undefined;
}, {
    quantity?: number | undefined;
    unit_price?: number | null | undefined;
    compare_at_unit_price?: number | null | undefined;
    internal_note?: string | null | undefined;
}>;
export type AdminPostOrderEditsItemsActionReqSchemaType = z.infer<typeof AdminPostOrderEditsItemsActionReqSchema>;
export declare const AdminPostOrderEditsUpdateItemQuantityReqSchema: z.ZodObject<{
    quantity: z.ZodNumber;
    unit_price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    compare_at_unit_price: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    internal_note: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    unit_price?: number | null | undefined;
    compare_at_unit_price?: number | null | undefined;
    internal_note?: string | null | undefined;
}, {
    quantity: number;
    unit_price?: number | null | undefined;
    compare_at_unit_price?: number | null | undefined;
    internal_note?: string | null | undefined;
}>;
export type AdminPostOrderEditsUpdateItemQuantityReqSchemaType = z.infer<typeof AdminPostOrderEditsUpdateItemQuantityReqSchema>;
//# sourceMappingURL=validators.d.ts.map