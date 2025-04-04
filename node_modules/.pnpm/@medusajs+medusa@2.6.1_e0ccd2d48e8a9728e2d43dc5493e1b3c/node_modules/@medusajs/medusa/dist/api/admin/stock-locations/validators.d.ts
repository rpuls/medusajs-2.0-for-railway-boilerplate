import { z } from "zod";
export type AdminGetStockLocationParamsType = z.infer<typeof AdminGetStockLocationParams>;
export declare const AdminGetStockLocationParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminGetStockLocationsParamsDirectFields: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    address_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
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
    id?: string | string[] | undefined;
    name?: string | string[] | undefined;
    address_id?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}, {
    q?: string | undefined;
    id?: string | string[] | undefined;
    name?: string | string[] | undefined;
    address_id?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}>;
export type AdminGetStockLocationsParamsType = z.infer<typeof AdminGetStockLocationsParams>;
export declare const AdminGetStockLocationsParams: z.ZodObject<{
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    sales_channel_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
}, "strip", z.ZodTypeAny, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    sales_channel_id?: string | string[] | undefined;
}, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    sales_channel_id?: string | string[] | undefined;
}>;
export type AdminUpsertStockLocationAddressType = z.infer<typeof AdminUpsertStockLocationAddress>;
export declare const AdminUpsertStockLocationAddress: z.ZodObject<{
    address_1: z.ZodString;
    address_2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    company: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    country_code: z.ZodString;
    phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    province: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    address_1: string;
    country_code: string;
    address_2?: string | null | undefined;
    company?: string | null | undefined;
    city?: string | null | undefined;
    phone?: string | null | undefined;
    postal_code?: string | null | undefined;
    province?: string | null | undefined;
}, {
    address_1: string;
    country_code: string;
    address_2?: string | null | undefined;
    company?: string | null | undefined;
    city?: string | null | undefined;
    phone?: string | null | undefined;
    postal_code?: string | null | undefined;
    province?: string | null | undefined;
}>;
export type AdminCreateStockLocationType = z.infer<typeof AdminCreateStockLocation>;
export declare const AdminCreateStockLocation: z.ZodObject<{
    name: z.ZodEffects<z.ZodString, string, unknown>;
    address: z.ZodOptional<z.ZodObject<{
        address_1: z.ZodString;
        address_2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        company: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        country_code: z.ZodString;
        phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        province: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        address_1: string;
        country_code: string;
        address_2?: string | null | undefined;
        company?: string | null | undefined;
        city?: string | null | undefined;
        phone?: string | null | undefined;
        postal_code?: string | null | undefined;
        province?: string | null | undefined;
    }, {
        address_1: string;
        country_code: string;
        address_2?: string | null | undefined;
        company?: string | null | undefined;
        city?: string | null | undefined;
        phone?: string | null | undefined;
        postal_code?: string | null | undefined;
        province?: string | null | undefined;
    }>>;
    address_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    address?: {
        address_1: string;
        country_code: string;
        address_2?: string | null | undefined;
        company?: string | null | undefined;
        city?: string | null | undefined;
        phone?: string | null | undefined;
        postal_code?: string | null | undefined;
        province?: string | null | undefined;
    } | undefined;
    address_id?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    name?: unknown;
    address?: {
        address_1: string;
        country_code: string;
        address_2?: string | null | undefined;
        company?: string | null | undefined;
        city?: string | null | undefined;
        phone?: string | null | undefined;
        postal_code?: string | null | undefined;
        province?: string | null | undefined;
    } | undefined;
    address_id?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type AdminUpdateStockLocationType = z.infer<typeof AdminUpdateStockLocation>;
export declare const AdminUpdateStockLocation: z.ZodObject<{
    name: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>>;
    address: z.ZodOptional<z.ZodObject<{
        address_1: z.ZodString;
        address_2: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        company: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        country_code: z.ZodString;
        phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        postal_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        province: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        address_1: string;
        country_code: string;
        address_2?: string | null | undefined;
        company?: string | null | undefined;
        city?: string | null | undefined;
        phone?: string | null | undefined;
        postal_code?: string | null | undefined;
        province?: string | null | undefined;
    }, {
        address_1: string;
        country_code: string;
        address_2?: string | null | undefined;
        company?: string | null | undefined;
        city?: string | null | undefined;
        phone?: string | null | undefined;
        postal_code?: string | null | undefined;
        province?: string | null | undefined;
    }>>;
    address_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    address?: {
        address_1: string;
        country_code: string;
        address_2?: string | null | undefined;
        company?: string | null | undefined;
        city?: string | null | undefined;
        phone?: string | null | undefined;
        postal_code?: string | null | undefined;
        province?: string | null | undefined;
    } | undefined;
    address_id?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    name?: unknown;
    address?: {
        address_1: string;
        country_code: string;
        address_2?: string | null | undefined;
        company?: string | null | undefined;
        city?: string | null | undefined;
        phone?: string | null | undefined;
        postal_code?: string | null | undefined;
        province?: string | null | undefined;
    } | undefined;
    address_id?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type AdminCreateStockLocationFulfillmentSetType = z.infer<typeof AdminCreateStockLocationFulfillmentSet>;
export declare const AdminCreateStockLocationFulfillmentSet: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodString;
}, "strict", z.ZodTypeAny, {
    name: string;
    type: string;
}, {
    name: string;
    type: string;
}>;
//# sourceMappingURL=validators.d.ts.map