import { z } from "zod";
export declare const StoreGetShippingOptionsParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const StoreGetShippingOptionsFields: z.ZodObject<{
    cart_id: z.ZodString;
    is_return: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    cart_id: string;
    is_return?: boolean | undefined;
}, {
    cart_id: string;
    is_return?: boolean | undefined;
}>;
export type StoreGetShippingOptionsType = z.infer<typeof StoreGetShippingOptions>;
export declare const StoreGetShippingOptions: z.ZodObject<{
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
export type StoreCalculateShippingOptionPriceType = z.infer<typeof StoreCalculateShippingOptionPrice>;
export declare const StoreCalculateShippingOptionPrice: z.ZodObject<{
    cart_id: z.ZodString;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    cart_id: string;
    data?: Record<string, unknown> | undefined;
}, {
    cart_id: string;
    data?: Record<string, unknown> | undefined;
}>;
//# sourceMappingURL=validators.d.ts.map