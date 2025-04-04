import { z } from "zod";
export type ReturnParamsType = z.infer<typeof ReturnParams>;
export declare const ReturnParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const ReturnsParamsFields: z.ZodObject<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    order_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
}, "strip", z.ZodTypeAny, {
    id?: string | string[] | undefined;
    order_id?: string | string[] | undefined;
}, {
    id?: string | string[] | undefined;
    order_id?: string | string[] | undefined;
}>;
export type ReturnsParamsType = z.infer<typeof ReturnsParams>;
export declare const ReturnsParams: z.ZodObject<{
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
export declare const StorePostReturnsReqSchema: z.ZodObject<{
    order_id: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        quantity: z.ZodNumber;
        reason_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        quantity: number;
        reason_id?: string | null | undefined;
        note?: string | null | undefined;
    }, {
        id: string;
        quantity: number;
        reason_id?: string | null | undefined;
        note?: string | null | undefined;
    }>, "many">;
    return_shipping: z.ZodObject<{
        option_id: z.ZodString;
        price: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        option_id: string;
        price?: number | undefined;
    }, {
        option_id: string;
        price?: number | undefined;
    }>;
    note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    receive_now: z.ZodOptional<z.ZodBoolean>;
    location_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    items: {
        id: string;
        quantity: number;
        reason_id?: string | null | undefined;
        note?: string | null | undefined;
    }[];
    order_id: string;
    return_shipping: {
        option_id: string;
        price?: number | undefined;
    };
    note?: string | null | undefined;
    receive_now?: boolean | undefined;
    location_id?: string | null | undefined;
}, {
    items: {
        id: string;
        quantity: number;
        reason_id?: string | null | undefined;
        note?: string | null | undefined;
    }[];
    order_id: string;
    return_shipping: {
        option_id: string;
        price?: number | undefined;
    };
    note?: string | null | undefined;
    receive_now?: boolean | undefined;
    location_id?: string | null | undefined;
}>;
export type StorePostReturnsReqSchemaType = z.infer<typeof StorePostReturnsReqSchema>;
//# sourceMappingURL=validators.d.ts.map