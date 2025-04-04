import { z } from "zod";
export type AdminGetTaxRateParamsType = z.infer<typeof AdminGetTaxRateParams>;
export declare const AdminGetTaxRateParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminGetTaxRatesParamsFields: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    tax_region_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodUnion<[any, z.ZodObject<{
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
    }>]>]>>;
    is_default: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"true">, z.ZodLiteral<"false">]>>;
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
    q?: string | undefined;
    tax_region_id?: any;
    is_default?: "true" | "false" | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}, {
    q?: string | undefined;
    tax_region_id?: any;
    is_default?: "true" | "false" | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}>;
export type AdminGetTaxRatesParamsType = z.infer<typeof AdminGetTaxRatesParams>;
export declare const AdminGetTaxRatesParams: z.ZodObject<{
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
export type AdminCreateTaxRateRuleType = z.infer<typeof AdminCreateTaxRateRule>;
export declare const AdminCreateTaxRateRule: z.ZodObject<{
    reference: z.ZodString;
    reference_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reference: string;
    reference_id: string;
}, {
    reference: string;
    reference_id: string;
}>;
export type AdminCreateTaxRateType = z.infer<typeof AdminCreateTaxRate>;
export declare const AdminCreateTaxRate: z.ZodObject<{
    rate: z.ZodOptional<z.ZodNumber>;
    code: z.ZodString;
    rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        reference_id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        reference_id: string;
    }, {
        reference: string;
        reference_id: string;
    }>, "many">>;
    name: z.ZodString;
    is_default: z.ZodOptional<z.ZodBoolean>;
    is_combinable: z.ZodOptional<z.ZodBoolean>;
    tax_region_id: z.ZodString;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    code: string;
    tax_region_id: string;
    rate?: number | undefined;
    rules?: {
        reference: string;
        reference_id: string;
    }[] | undefined;
    is_default?: boolean | undefined;
    is_combinable?: boolean | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    name: string;
    code: string;
    tax_region_id: string;
    rate?: number | undefined;
    rules?: {
        reference: string;
        reference_id: string;
    }[] | undefined;
    is_default?: boolean | undefined;
    is_combinable?: boolean | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type AdminUpdateTaxRateType = z.infer<typeof AdminUpdateTaxRate>;
export declare const AdminUpdateTaxRate: z.ZodObject<{
    rate: z.ZodOptional<z.ZodNumber>;
    code: z.ZodOptional<z.ZodString>;
    rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        reference_id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        reference: string;
        reference_id: string;
    }, {
        reference: string;
        reference_id: string;
    }>, "many">>;
    name: z.ZodOptional<z.ZodString>;
    is_default: z.ZodOptional<z.ZodBoolean>;
    is_combinable: z.ZodOptional<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    rate?: number | undefined;
    code?: string | undefined;
    rules?: {
        reference: string;
        reference_id: string;
    }[] | undefined;
    name?: string | undefined;
    is_default?: boolean | undefined;
    is_combinable?: boolean | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    rate?: number | undefined;
    code?: string | undefined;
    rules?: {
        reference: string;
        reference_id: string;
    }[] | undefined;
    name?: string | undefined;
    is_default?: boolean | undefined;
    is_combinable?: boolean | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
//# sourceMappingURL=validators.d.ts.map