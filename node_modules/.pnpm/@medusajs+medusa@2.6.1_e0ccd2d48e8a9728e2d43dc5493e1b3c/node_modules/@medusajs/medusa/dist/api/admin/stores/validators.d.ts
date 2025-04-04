import { z } from "zod";
export type AdminGetStoreParamsType = z.infer<typeof AdminGetStoreParams>;
export declare const AdminGetStoreParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminGetStoresParamsFields: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
}, "strip", z.ZodTypeAny, {
    q?: string | undefined;
    id?: string | string[] | undefined;
    name?: string | string[] | undefined;
}, {
    q?: string | undefined;
    id?: string | string[] | undefined;
    name?: string | string[] | undefined;
}>;
export type AdminGetStoresParamsType = z.infer<typeof AdminGetStoresParams>;
export declare const AdminGetStoresParams: z.ZodObject<{
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and: z.ZodOptional<z.ZodLazy<z.ZodArray<z.ZodObject<any, z.UnknownKeysParam, z.ZodTypeAny, {
        [x: string]: any;
    }, {
        [x: string]: any;
    }>, "many">>>;
    $or: z.ZodOptional<z.ZodLazy<z.ZodArray<z.ZodObject<any, z.UnknownKeysParam, z.ZodTypeAny, {
        [x: string]: any;
    }, {
        [x: string]: any;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and?: {
        [x: string]: any;
    }[] | undefined;
    $or?: {
        [x: string]: any;
    }[] | undefined;
}, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    $and?: {
        [x: string]: any;
    }[] | undefined;
    $or?: {
        [x: string]: any;
    }[] | undefined;
}>;
export type AdminUpdateStoreType = z.infer<typeof AdminUpdateStore>;
export declare const AdminUpdateStore: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    supported_currencies: z.ZodOptional<z.ZodArray<z.ZodObject<{
        currency_code: z.ZodString;
        is_default: z.ZodOptional<z.ZodBoolean>;
        is_tax_inclusive: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        currency_code: string;
        is_default?: boolean | undefined;
        is_tax_inclusive?: boolean | undefined;
    }, {
        currency_code: string;
        is_default?: boolean | undefined;
        is_tax_inclusive?: boolean | undefined;
    }>, "many">>;
    default_sales_channel_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    default_region_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    default_location_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    supported_currencies?: {
        currency_code: string;
        is_default?: boolean | undefined;
        is_tax_inclusive?: boolean | undefined;
    }[] | undefined;
    default_sales_channel_id?: string | null | undefined;
    default_region_id?: string | null | undefined;
    default_location_id?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    name?: string | undefined;
    supported_currencies?: {
        currency_code: string;
        is_default?: boolean | undefined;
        is_tax_inclusive?: boolean | undefined;
    }[] | undefined;
    default_sales_channel_id?: string | null | undefined;
    default_region_id?: string | null | undefined;
    default_location_id?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
//# sourceMappingURL=validators.d.ts.map