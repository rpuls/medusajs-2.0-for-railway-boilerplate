import { z } from "zod";
export declare const AdminGetPricePreferenceParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminGetPricePreferencesParamsFields: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    attribute: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    value: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
}, "strip", z.ZodTypeAny, {
    q?: string | undefined;
    id?: string | string[] | undefined;
    attribute?: string | string[] | undefined;
    value?: string | string[] | undefined;
}, {
    q?: string | undefined;
    id?: string | string[] | undefined;
    attribute?: string | string[] | undefined;
    value?: string | string[] | undefined;
}>;
export declare const AdminGetPricePreferencesParams: z.ZodObject<{
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
export declare const AdminCreatePricePreference: z.ZodObject<{
    attribute: z.ZodString;
    value: z.ZodString;
    is_tax_inclusive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    value: string;
    attribute: string;
    is_tax_inclusive?: boolean | undefined;
}, {
    value: string;
    attribute: string;
    is_tax_inclusive?: boolean | undefined;
}>;
export type AdminCreatePricePreferencePriceType = z.infer<typeof AdminCreatePricePreference>;
export declare const AdminUpdatePricePreference: z.ZodObject<{
    attribute: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodString>;
    is_tax_inclusive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    attribute?: string | undefined;
    value?: string | undefined;
    is_tax_inclusive?: boolean | undefined;
}, {
    attribute?: string | undefined;
    value?: string | undefined;
    is_tax_inclusive?: boolean | undefined;
}>;
export type AdminUpdatePricePreferenceType = z.infer<typeof AdminUpdatePricePreference>;
//# sourceMappingURL=validators.d.ts.map