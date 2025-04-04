import { z } from "zod";
export type AdminGetCustomerGroupParamsType = z.infer<typeof AdminGetCustomerGroupParams>;
export declare const AdminGetCustomerGroupParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminCustomerInGroupFilters: z.ZodObject<{
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    email: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodUnion<[any, z.ZodObject<{
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
    default_billing_address_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    default_shipping_address_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    company_name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    first_name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    last_name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    created_by: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
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
    id?: string | string[] | undefined;
    email?: any;
    default_billing_address_id?: string | string[] | undefined;
    default_shipping_address_id?: string | string[] | undefined;
    company_name?: string | string[] | undefined;
    first_name?: string | string[] | undefined;
    last_name?: string | string[] | undefined;
    created_by?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}, {
    id?: string | string[] | undefined;
    email?: any;
    default_billing_address_id?: string | string[] | undefined;
    default_shipping_address_id?: string | string[] | undefined;
    company_name?: string | string[] | undefined;
    first_name?: string | string[] | undefined;
    last_name?: string | string[] | undefined;
    created_by?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}>;
export declare const AdminGetCustomerGroupsParamsFields: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    customers: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodObject<{
        id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        email: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">, z.ZodUnion<[any, z.ZodObject<{
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
        default_billing_address_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        default_shipping_address_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        company_name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        first_name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        last_name: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        created_by: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
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
        id?: string | string[] | undefined;
        email?: any;
        default_billing_address_id?: string | string[] | undefined;
        default_shipping_address_id?: string | string[] | undefined;
        company_name?: string | string[] | undefined;
        first_name?: string | string[] | undefined;
        last_name?: string | string[] | undefined;
        created_by?: string | string[] | undefined;
        created_at?: any;
        updated_at?: any;
        deleted_at?: any;
    }, {
        id?: string | string[] | undefined;
        email?: any;
        default_billing_address_id?: string | string[] | undefined;
        default_shipping_address_id?: string | string[] | undefined;
        company_name?: string | string[] | undefined;
        first_name?: string | string[] | undefined;
        last_name?: string | string[] | undefined;
        created_by?: string | string[] | undefined;
        created_at?: any;
        updated_at?: any;
        deleted_at?: any;
    }>]>>;
    created_by: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
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
    customers?: string | string[] | {
        id?: string | string[] | undefined;
        email?: any;
        default_billing_address_id?: string | string[] | undefined;
        default_shipping_address_id?: string | string[] | undefined;
        company_name?: string | string[] | undefined;
        first_name?: string | string[] | undefined;
        last_name?: string | string[] | undefined;
        created_by?: string | string[] | undefined;
        created_at?: any;
        updated_at?: any;
        deleted_at?: any;
    } | undefined;
    created_by?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}, {
    q?: string | undefined;
    id?: string | string[] | undefined;
    name?: string | string[] | undefined;
    customers?: string | string[] | {
        id?: string | string[] | undefined;
        email?: any;
        default_billing_address_id?: string | string[] | undefined;
        default_shipping_address_id?: string | string[] | undefined;
        company_name?: string | string[] | undefined;
        first_name?: string | string[] | undefined;
        last_name?: string | string[] | undefined;
        created_by?: string | string[] | undefined;
        created_at?: any;
        updated_at?: any;
        deleted_at?: any;
    } | undefined;
    created_by?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}>;
export type AdminGetCustomerGroupsParamsType = z.infer<typeof AdminGetCustomerGroupsParams>;
export declare const AdminGetCustomerGroupsParams: z.ZodObject<{
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
export type AdminCreateCustomerGroupType = z.infer<typeof AdminCreateCustomerGroup>;
export declare const AdminCreateCustomerGroup: z.ZodObject<{
    name: z.ZodString;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    name: string;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export type AdminUpdateCustomerGroupType = z.infer<typeof AdminUpdateCustomerGroup>;
export declare const AdminUpdateCustomerGroup: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    name?: string | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
//# sourceMappingURL=validators.d.ts.map