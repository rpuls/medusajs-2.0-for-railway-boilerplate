import { PriceListStatus, PriceListType } from "@medusajs/framework/utils";
import { z } from "zod";
export declare const AdminGetPriceListPricesParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminGetPriceListsParamsFields: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    starts_at: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
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
    ends_at: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
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
    status: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof PriceListStatus>, "many">>;
    rules_count: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    q?: string | undefined;
    id?: string | string[] | undefined;
    starts_at?: any;
    ends_at?: any;
    status?: PriceListStatus[] | undefined;
    rules_count?: number[] | undefined;
}, {
    q?: string | undefined;
    id?: string | string[] | undefined;
    starts_at?: any;
    ends_at?: any;
    status?: PriceListStatus[] | undefined;
    rules_count?: number[] | undefined;
}>;
export declare const AdminGetPriceListsParams: z.ZodObject<{
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
export declare const AdminGetPriceListParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminCreatePriceListPrice: z.ZodObject<{
    currency_code: z.ZodString;
    amount: z.ZodNumber;
    variant_id: z.ZodString;
    min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    currency_code: string;
    variant_id: string;
    min_quantity?: number | null | undefined;
    max_quantity?: number | null | undefined;
    rules?: Record<string, string> | undefined;
}, {
    amount: number;
    currency_code: string;
    variant_id: string;
    min_quantity?: number | null | undefined;
    max_quantity?: number | null | undefined;
    rules?: Record<string, string> | undefined;
}>;
export type AdminCreatePriceListPriceType = z.infer<typeof AdminCreatePriceListPrice>;
export declare const AdminUpdatePriceListPrice: z.ZodObject<{
    id: z.ZodString;
    currency_code: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    variant_id: z.ZodString;
    min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    variant_id: string;
    currency_code?: string | undefined;
    amount?: number | undefined;
    min_quantity?: number | null | undefined;
    max_quantity?: number | null | undefined;
    rules?: Record<string, string> | undefined;
}, {
    id: string;
    variant_id: string;
    currency_code?: string | undefined;
    amount?: number | undefined;
    min_quantity?: number | null | undefined;
    max_quantity?: number | null | undefined;
    rules?: Record<string, string> | undefined;
}>;
export type AdminUpdatePriceListPriceType = z.infer<typeof AdminUpdatePriceListPrice>;
export declare const AdminCreatePriceList: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    starts_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ends_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof PriceListStatus>>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof PriceListType>>;
    rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>;
    prices: z.ZodOptional<z.ZodArray<z.ZodObject<{
        currency_code: z.ZodString;
        amount: z.ZodNumber;
        variant_id: z.ZodString;
        min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        currency_code: string;
        variant_id: string;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }, {
        amount: number;
        currency_code: string;
        variant_id: string;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    description: string;
    title: string;
    starts_at?: string | null | undefined;
    ends_at?: string | null | undefined;
    status?: PriceListStatus | undefined;
    type?: PriceListType | undefined;
    rules?: Record<string, string[]> | undefined;
    prices?: {
        amount: number;
        currency_code: string;
        variant_id: string;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }[] | undefined;
}, {
    description: string;
    title: string;
    starts_at?: string | null | undefined;
    ends_at?: string | null | undefined;
    status?: PriceListStatus | undefined;
    type?: PriceListType | undefined;
    rules?: Record<string, string[]> | undefined;
    prices?: {
        amount: number;
        currency_code: string;
        variant_id: string;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }[] | undefined;
}>;
export type AdminCreatePriceListType = z.infer<typeof AdminCreatePriceList>;
export declare const AdminUpdatePriceList: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    starts_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ends_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof PriceListStatus>>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof PriceListType>>;
    rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | null | undefined;
    starts_at?: string | null | undefined;
    ends_at?: string | null | undefined;
    status?: PriceListStatus | undefined;
    type?: PriceListType | undefined;
    rules?: Record<string, string[]> | undefined;
}, {
    title?: string | undefined;
    description?: string | null | undefined;
    starts_at?: string | null | undefined;
    ends_at?: string | null | undefined;
    status?: PriceListStatus | undefined;
    type?: PriceListType | undefined;
    rules?: Record<string, string[]> | undefined;
}>;
export type AdminUpdatePriceListType = z.infer<typeof AdminUpdatePriceList>;
export declare const AdminRemoveProductsPriceList: z.ZodObject<{
    remove: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    remove?: string[] | undefined;
}, {
    remove?: string[] | undefined;
}>;
export type AdminRemoveProductsPriceListType = z.infer<typeof AdminRemoveProductsPriceList>;
//# sourceMappingURL=validators.d.ts.map