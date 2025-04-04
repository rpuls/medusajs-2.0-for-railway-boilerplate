import { BatchMethodRequest } from "@medusajs/framework/types";
import { ProductStatus } from "@medusajs/framework/utils";
import { z } from "zod";
export declare const AdminGetProductParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminGetProductVariantParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminGetProductOptionParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminGetProductVariantsParamsFields: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    manage_inventory: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    allow_backorder: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
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
    manage_inventory?: boolean | undefined;
    allow_backorder?: boolean | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}, {
    q?: string | undefined;
    id?: string | string[] | undefined;
    manage_inventory?: string | boolean | undefined;
    allow_backorder?: string | boolean | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}>;
export type AdminGetProductVariantsParamsType = z.infer<typeof AdminGetProductVariantsParams>;
export declare const AdminGetProductVariantsParams: z.ZodObject<{
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
export declare const AdminGetProductsParamsDirectFields: z.ZodObject<{
    variants: z.ZodOptional<z.ZodObject<{
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
    }>>;
    status: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ProductStatus>, "many">>;
}, "strip", z.ZodTypeAny, {
    variants?: {
        [x: string]: any;
        [x: number]: any;
        [x: symbol]: any;
        $and?: {
            [x: string]: any;
        }[] | undefined;
        $or?: {
            [x: string]: any;
        }[] | undefined;
    } | undefined;
    status?: ProductStatus[] | undefined;
}, {
    variants?: {
        [x: string]: any;
        [x: number]: any;
        [x: symbol]: any;
        $and?: {
            [x: string]: any;
        }[] | undefined;
        $or?: {
            [x: string]: any;
        }[] | undefined;
    } | undefined;
    status?: ProductStatus[] | undefined;
}>;
export type AdminGetProductsParamsType = z.infer<typeof AdminGetProductsParams>;
export declare const AdminGetProductsParams: z.ZodEffects<z.ZodObject<{
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    sales_channel_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    q: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    title: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    handle: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    is_giftcard: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    category_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    external_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    collection_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    tag_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    type_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
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
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    sales_channel_id?: string | string[] | undefined;
    q?: string | undefined;
    id?: string | string[] | undefined;
    title?: string | string[] | undefined;
    handle?: string | string[] | undefined;
    is_giftcard?: boolean | undefined;
    category_id?: string | string[] | undefined;
    external_id?: string | string[] | undefined;
    collection_id?: string | string[] | undefined;
    tag_id?: string | string[] | undefined;
    type_id?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    sales_channel_id?: string | string[] | undefined;
    q?: string | undefined;
    id?: string | string[] | undefined;
    title?: string | string[] | undefined;
    handle?: string | string[] | undefined;
    is_giftcard?: string | boolean | undefined;
    category_id?: string | string[] | undefined;
    external_id?: string | string[] | undefined;
    collection_id?: string | string[] | undefined;
    tag_id?: string | string[] | undefined;
    type_id?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}>, import("@medusajs/framework/types").FilterableProductProps, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    sales_channel_id?: string | string[] | undefined;
    q?: string | undefined;
    id?: string | string[] | undefined;
    title?: string | string[] | undefined;
    handle?: string | string[] | undefined;
    is_giftcard?: string | boolean | undefined;
    category_id?: string | string[] | undefined;
    external_id?: string | string[] | undefined;
    collection_id?: string | string[] | undefined;
    tag_id?: string | string[] | undefined;
    type_id?: string | string[] | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}>;
export declare const AdminGetProductOptionsParamsFields: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    title: z.ZodOptional<z.ZodString>;
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
    title?: string | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}, {
    q?: string | undefined;
    id?: string | string[] | undefined;
    title?: string | undefined;
    created_at?: any;
    updated_at?: any;
    deleted_at?: any;
}>;
export type AdminGetProductOptionsParamsType = z.infer<typeof AdminGetProductOptionsParams>;
export declare const AdminGetProductOptionsParams: z.ZodObject<{
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
export type AdminCreateProductTagType = z.infer<typeof AdminCreateProductTag>;
export declare const AdminCreateProductTag: z.ZodObject<{
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value: string;
}, {
    value: string;
}>;
export type AdminUpdateProductTagType = z.infer<typeof AdminUpdateProductTag>;
export declare const AdminUpdateProductTag: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    value?: string | undefined;
}, {
    id?: string | undefined;
    value?: string | undefined;
}>;
export type AdminCreateProductOptionType = z.infer<typeof CreateProductOption>;
export declare const CreateProductOption: z.ZodObject<{
    title: z.ZodString;
    values: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    values: string[];
    title: string;
}, {
    values: string[];
    title: string;
}>;
export declare const AdminCreateProductOption: (additionalDataValidator?: z.ZodOptional<z.ZodNullable<z.ZodObject<any, any>>>) => z.ZodObject<any, any, z.ZodTypeAny, {
    [x: string]: any;
}, {
    [x: string]: any;
}> | z.ZodEffects<any, any, any>;
export type AdminUpdateProductOptionType = z.infer<typeof UpdateProductOption>;
export declare const UpdateProductOption: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    values: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    title?: string | undefined;
    values?: string[] | undefined;
}, {
    id?: string | undefined;
    title?: string | undefined;
    values?: string[] | undefined;
}>;
export declare const AdminUpdateProductOption: (additionalDataValidator?: z.ZodOptional<z.ZodNullable<z.ZodObject<any, any>>>) => z.ZodObject<any, any, z.ZodTypeAny, {
    [x: string]: any;
}, {
    [x: string]: any;
}> | z.ZodEffects<any, any, any>;
export type AdminCreateVariantPriceType = z.infer<typeof AdminCreateVariantPrice>;
export declare const AdminCreateVariantPrice: z.ZodObject<{
    currency_code: z.ZodString;
    amount: z.ZodNumber;
    min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    currency_code: string;
    min_quantity?: number | null | undefined;
    max_quantity?: number | null | undefined;
    rules?: Record<string, string> | undefined;
}, {
    amount: number;
    currency_code: string;
    min_quantity?: number | null | undefined;
    max_quantity?: number | null | undefined;
    rules?: Record<string, string> | undefined;
}>;
export type AdminUpdateVariantPriceType = z.infer<typeof AdminUpdateVariantPrice>;
export declare const AdminUpdateVariantPrice: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    currency_code: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id?: string | undefined;
    currency_code?: string | undefined;
    amount?: number | undefined;
    min_quantity?: number | null | undefined;
    max_quantity?: number | null | undefined;
    rules?: Record<string, string> | undefined;
}, {
    id?: string | undefined;
    currency_code?: string | undefined;
    amount?: number | undefined;
    min_quantity?: number | null | undefined;
    max_quantity?: number | null | undefined;
    rules?: Record<string, string> | undefined;
}>;
export type AdminCreateProductTypeType = z.infer<typeof AdminCreateProductType>;
export declare const AdminCreateProductType: z.ZodObject<{
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value: string;
}, {
    value: string;
}>;
export type AdminCreateProductVariantType = z.infer<typeof CreateProductVariant>;
export declare const CreateProductVariant: z.ZodObject<{
    title: z.ZodString;
    sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ean: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    upc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    allow_backorder: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>>;
    manage_inventory: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>>;
    variant_rank: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    prices: z.ZodArray<z.ZodObject<{
        currency_code: z.ZodString;
        amount: z.ZodNumber;
        min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        currency_code: string;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }, {
        amount: number;
        currency_code: string;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }>, "many">;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    inventory_items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        inventory_item_id: z.ZodString;
        required_quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        inventory_item_id: string;
        required_quantity: number;
    }, {
        inventory_item_id: string;
        required_quantity: number;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    prices: {
        amount: number;
        currency_code: string;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }[];
    title: string;
    allow_backorder: boolean;
    manage_inventory: boolean;
    sku?: string | null | undefined;
    ean?: string | null | undefined;
    upc?: string | null | undefined;
    barcode?: string | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    variant_rank?: number | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    options?: Record<string, string> | undefined;
    inventory_items?: {
        inventory_item_id: string;
        required_quantity: number;
    }[] | undefined;
}, {
    prices: {
        amount: number;
        currency_code: string;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }[];
    title: string;
    sku?: string | null | undefined;
    ean?: string | null | undefined;
    upc?: string | null | undefined;
    barcode?: string | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    allow_backorder?: string | boolean | undefined;
    manage_inventory?: string | boolean | undefined;
    variant_rank?: number | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    options?: Record<string, string> | undefined;
    inventory_items?: {
        inventory_item_id: string;
        required_quantity: number;
    }[] | undefined;
}>;
export declare const AdminCreateProductVariant: (additionalDataValidator?: z.ZodOptional<z.ZodNullable<z.ZodObject<any, any>>>) => z.ZodObject<any, any, z.ZodTypeAny, {
    [x: string]: any;
}, {
    [x: string]: any;
}> | z.ZodEffects<any, any, any>;
export type AdminUpdateProductVariantType = z.infer<typeof UpdateProductVariant>;
export declare const UpdateProductVariant: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    prices: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        currency_code: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodNumber>;
        min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }, {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }>, "many">>;
    sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ean: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    upc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    allow_backorder: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    manage_inventory: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    variant_rank: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    id?: string | undefined;
    title?: string | undefined;
    prices?: {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }[] | undefined;
    sku?: string | null | undefined;
    ean?: string | null | undefined;
    upc?: string | null | undefined;
    barcode?: string | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    allow_backorder?: boolean | undefined;
    manage_inventory?: boolean | undefined;
    variant_rank?: number | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    options?: Record<string, string> | undefined;
}, {
    id?: string | undefined;
    title?: string | undefined;
    prices?: {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }[] | undefined;
    sku?: string | null | undefined;
    ean?: string | null | undefined;
    upc?: string | null | undefined;
    barcode?: string | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    allow_backorder?: string | boolean | undefined;
    manage_inventory?: string | boolean | undefined;
    variant_rank?: number | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    options?: Record<string, string> | undefined;
}>;
export declare const AdminUpdateProductVariant: (additionalDataValidator?: z.ZodOptional<z.ZodNullable<z.ZodObject<any, any>>>) => z.ZodObject<any, any, z.ZodTypeAny, {
    [x: string]: any;
}, {
    [x: string]: any;
}> | z.ZodEffects<any, any, any>;
export type AdminBatchUpdateProductVariantType = z.infer<typeof AdminBatchUpdateProductVariant>;
export declare const AdminBatchUpdateProductVariant: z.ZodObject<{
    length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    prices: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        currency_code: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodNumber>;
        min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }, {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }>, "many">>;
    title: z.ZodOptional<z.ZodString>;
    sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    allow_backorder: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    ean: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    upc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    manage_inventory: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    variant_rank: z.ZodOptional<z.ZodNumber>;
    id: z.ZodString;
}, "strict", z.ZodTypeAny, {
    id: string;
    length?: number | null | undefined;
    options?: Record<string, string> | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    prices?: {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }[] | undefined;
    title?: string | undefined;
    sku?: string | null | undefined;
    barcode?: string | null | undefined;
    allow_backorder?: boolean | undefined;
    origin_country?: string | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    material?: string | null | undefined;
    weight?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    ean?: string | null | undefined;
    upc?: string | null | undefined;
    manage_inventory?: boolean | undefined;
    variant_rank?: number | undefined;
}, {
    id: string;
    length?: number | null | undefined;
    options?: Record<string, string> | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    prices?: {
        id?: string | undefined;
        currency_code?: string | undefined;
        amount?: number | undefined;
        min_quantity?: number | null | undefined;
        max_quantity?: number | null | undefined;
        rules?: Record<string, string> | undefined;
    }[] | undefined;
    title?: string | undefined;
    sku?: string | null | undefined;
    barcode?: string | null | undefined;
    allow_backorder?: string | boolean | undefined;
    origin_country?: string | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    material?: string | null | undefined;
    weight?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    ean?: string | null | undefined;
    upc?: string | null | undefined;
    manage_inventory?: string | boolean | undefined;
    variant_rank?: number | undefined;
}>;
export declare const IdAssociation: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type AdminCreateProductType = z.infer<typeof CreateProduct>;
export declare const CreateProduct: z.ZodObject<{
    title: z.ZodString;
    subtitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_giftcard: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>>;
    discountable: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
    }, {
        url: string;
    }>, "many">>;
    thumbnail: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    handle: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodNativeEnum<typeof ProductStatus>>>>;
    external_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    collection_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    categories: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        values: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        values: string[];
        title: string;
    }, {
        values: string[];
        title: string;
    }>, "many">>;
    variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        ean: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        upc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        allow_backorder: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>>;
        manage_inventory: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>>;
        variant_rank: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        prices: z.ZodArray<z.ZodObject<{
            currency_code: z.ZodString;
            amount: z.ZodNumber;
            min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            amount: number;
            currency_code: string;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }, {
            amount: number;
            currency_code: string;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }>, "many">;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        inventory_items: z.ZodOptional<z.ZodArray<z.ZodObject<{
            inventory_item_id: z.ZodString;
            required_quantity: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            inventory_item_id: string;
            required_quantity: number;
        }, {
            inventory_item_id: string;
            required_quantity: number;
        }>, "many">>;
    }, "strict", z.ZodTypeAny, {
        prices: {
            amount: number;
            currency_code: string;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[];
        title: string;
        allow_backorder: boolean;
        manage_inventory: boolean;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
        inventory_items?: {
            inventory_item_id: string;
            required_quantity: number;
        }[] | undefined;
    }, {
        prices: {
            amount: number;
            currency_code: string;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[];
        title: string;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: string | boolean | undefined;
        manage_inventory?: string | boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
        inventory_items?: {
            inventory_item_id: string;
            required_quantity: number;
        }[] | undefined;
    }>, "many">>;
    sales_channels: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    shipping_profile_id: z.ZodOptional<z.ZodString>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strict", z.ZodTypeAny, {
    title: string;
    status: ProductStatus | null;
    is_giftcard: boolean;
    discountable: boolean;
    subtitle?: string | null | undefined;
    description?: string | null | undefined;
    images?: {
        url: string;
    }[] | undefined;
    thumbnail?: string | null | undefined;
    handle?: string | undefined;
    external_id?: string | null | undefined;
    type_id?: string | null | undefined;
    collection_id?: string | null | undefined;
    categories?: {
        id: string;
    }[] | undefined;
    tags?: {
        id: string;
    }[] | undefined;
    options?: {
        values: string[];
        title: string;
    }[] | undefined;
    variants?: {
        prices: {
            amount: number;
            currency_code: string;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[];
        title: string;
        allow_backorder: boolean;
        manage_inventory: boolean;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
        inventory_items?: {
            inventory_item_id: string;
            required_quantity: number;
        }[] | undefined;
    }[] | undefined;
    sales_channels?: {
        id: string;
    }[] | undefined;
    shipping_profile_id?: string | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    title: string;
    subtitle?: string | null | undefined;
    description?: string | null | undefined;
    is_giftcard?: string | boolean | undefined;
    discountable?: string | boolean | undefined;
    images?: {
        url: string;
    }[] | undefined;
    thumbnail?: string | null | undefined;
    handle?: string | undefined;
    status?: ProductStatus | null | undefined;
    external_id?: string | null | undefined;
    type_id?: string | null | undefined;
    collection_id?: string | null | undefined;
    categories?: {
        id: string;
    }[] | undefined;
    tags?: {
        id: string;
    }[] | undefined;
    options?: {
        values: string[];
        title: string;
    }[] | undefined;
    variants?: {
        prices: {
            amount: number;
            currency_code: string;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[];
        title: string;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: string | boolean | undefined;
        manage_inventory?: string | boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
        inventory_items?: {
            inventory_item_id: string;
            required_quantity: number;
        }[] | undefined;
    }[] | undefined;
    sales_channels?: {
        id: string;
    }[] | undefined;
    shipping_profile_id?: string | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export declare const AdminCreateProduct: (additionalDataValidator?: z.ZodOptional<z.ZodNullable<z.ZodObject<any, any>>>) => z.ZodObject<any, any, z.ZodTypeAny, {
    [x: string]: any;
}, {
    [x: string]: any;
}> | z.ZodEffects<any, any, any>;
export type AdminUpdateProductType = z.infer<typeof UpdateProduct>;
export declare const UpdateProduct: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    discountable: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    is_giftcard: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        values: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id?: string | undefined;
        title?: string | undefined;
        values?: string[] | undefined;
    }, {
        id?: string | undefined;
        title?: string | undefined;
        values?: string[] | undefined;
    }>, "many">>;
    variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        prices: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            currency_code: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodNumber>;
            min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }, {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }>, "many">>;
        sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        ean: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        upc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        allow_backorder: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
        manage_inventory: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
        variant_rank: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strict", z.ZodTypeAny, {
        id?: string | undefined;
        title?: string | undefined;
        prices?: {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[] | undefined;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        manage_inventory?: boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
    }, {
        id?: string | undefined;
        title?: string | undefined;
        prices?: {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[] | undefined;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: string | boolean | undefined;
        manage_inventory?: string | boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
    }>, "many">>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ProductStatus>>;
    subtitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
    }, {
        url: string;
    }>, "many">>;
    thumbnail: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    handle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    external_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    collection_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    categories: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    sales_channels: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    shipping_profile_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strict", z.ZodTypeAny, {
    title?: string | undefined;
    discountable?: boolean | undefined;
    is_giftcard?: boolean | undefined;
    options?: {
        id?: string | undefined;
        title?: string | undefined;
        values?: string[] | undefined;
    }[] | undefined;
    variants?: {
        id?: string | undefined;
        title?: string | undefined;
        prices?: {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[] | undefined;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        manage_inventory?: boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
    }[] | undefined;
    status?: ProductStatus | undefined;
    subtitle?: string | null | undefined;
    description?: string | null | undefined;
    images?: {
        url: string;
    }[] | undefined;
    thumbnail?: string | null | undefined;
    handle?: string | null | undefined;
    type_id?: string | null | undefined;
    external_id?: string | null | undefined;
    collection_id?: string | null | undefined;
    categories?: {
        id: string;
    }[] | undefined;
    tags?: {
        id: string;
    }[] | undefined;
    sales_channels?: {
        id: string;
    }[] | undefined;
    shipping_profile_id?: string | null | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    title?: string | undefined;
    discountable?: string | boolean | undefined;
    is_giftcard?: string | boolean | undefined;
    options?: {
        id?: string | undefined;
        title?: string | undefined;
        values?: string[] | undefined;
    }[] | undefined;
    variants?: {
        id?: string | undefined;
        title?: string | undefined;
        prices?: {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[] | undefined;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: string | boolean | undefined;
        manage_inventory?: string | boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
    }[] | undefined;
    status?: ProductStatus | undefined;
    subtitle?: string | null | undefined;
    description?: string | null | undefined;
    images?: {
        url: string;
    }[] | undefined;
    thumbnail?: string | null | undefined;
    handle?: string | null | undefined;
    type_id?: string | null | undefined;
    external_id?: string | null | undefined;
    collection_id?: string | null | undefined;
    categories?: {
        id: string;
    }[] | undefined;
    tags?: {
        id: string;
    }[] | undefined;
    sales_channels?: {
        id: string;
    }[] | undefined;
    shipping_profile_id?: string | null | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    origin_country?: string | null | undefined;
    material?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export declare const AdminUpdateProduct: (additionalDataValidator?: z.ZodOptional<z.ZodNullable<z.ZodObject<any, any>>>) => z.ZodObject<any, any, z.ZodTypeAny, {
    [x: string]: any;
}, {
    [x: string]: any;
}> | z.ZodEffects<any, any, any>;
export type AdminBatchUpdateProductType = z.infer<typeof AdminBatchUpdateProduct>;
export declare const AdminBatchUpdateProduct: z.ZodObject<{
    length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        values: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id?: string | undefined;
        title?: string | undefined;
        values?: string[] | undefined;
    }, {
        id?: string | undefined;
        title?: string | undefined;
        values?: string[] | undefined;
    }>, "many">>;
    variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        prices: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            currency_code: z.ZodOptional<z.ZodString>;
            amount: z.ZodOptional<z.ZodNumber>;
            min_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_quantity: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            rules: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }, {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }>, "many">>;
        sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        ean: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        upc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        allow_backorder: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
        manage_inventory: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
        variant_rank: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strict", z.ZodTypeAny, {
        id?: string | undefined;
        title?: string | undefined;
        prices?: {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[] | undefined;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        manage_inventory?: boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
    }, {
        id?: string | undefined;
        title?: string | undefined;
        prices?: {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[] | undefined;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: string | boolean | undefined;
        manage_inventory?: string | boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
    }>, "many">>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    shipping_profile_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    title: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ProductStatus>>;
    handle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_giftcard: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    external_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    collection_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    thumbnail: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    subtitle: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    discountable: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    categories: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
    }, {
        url: string;
    }>, "many">>;
    sales_channels: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>, "many">>;
    id: z.ZodString;
}, "strict", z.ZodTypeAny, {
    id: string;
    length?: number | null | undefined;
    options?: {
        id?: string | undefined;
        title?: string | undefined;
        values?: string[] | undefined;
    }[] | undefined;
    variants?: {
        id?: string | undefined;
        title?: string | undefined;
        prices?: {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[] | undefined;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: boolean | undefined;
        manage_inventory?: boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
    }[] | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    shipping_profile_id?: string | null | undefined;
    description?: string | null | undefined;
    title?: string | undefined;
    status?: ProductStatus | undefined;
    handle?: string | null | undefined;
    is_giftcard?: boolean | undefined;
    external_id?: string | null | undefined;
    collection_id?: string | null | undefined;
    type_id?: string | null | undefined;
    thumbnail?: string | null | undefined;
    origin_country?: string | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    material?: string | null | undefined;
    weight?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    subtitle?: string | null | undefined;
    discountable?: boolean | undefined;
    categories?: {
        id: string;
    }[] | undefined;
    tags?: {
        id: string;
    }[] | undefined;
    images?: {
        url: string;
    }[] | undefined;
    sales_channels?: {
        id: string;
    }[] | undefined;
}, {
    id: string;
    length?: number | null | undefined;
    options?: {
        id?: string | undefined;
        title?: string | undefined;
        values?: string[] | undefined;
    }[] | undefined;
    variants?: {
        id?: string | undefined;
        title?: string | undefined;
        prices?: {
            id?: string | undefined;
            currency_code?: string | undefined;
            amount?: number | undefined;
            min_quantity?: number | null | undefined;
            max_quantity?: number | null | undefined;
            rules?: Record<string, string> | undefined;
        }[] | undefined;
        sku?: string | null | undefined;
        ean?: string | null | undefined;
        upc?: string | null | undefined;
        barcode?: string | null | undefined;
        hs_code?: string | null | undefined;
        mid_code?: string | null | undefined;
        allow_backorder?: string | boolean | undefined;
        manage_inventory?: string | boolean | undefined;
        variant_rank?: number | undefined;
        weight?: number | null | undefined;
        length?: number | null | undefined;
        height?: number | null | undefined;
        width?: number | null | undefined;
        origin_country?: string | null | undefined;
        material?: string | null | undefined;
        metadata?: Record<string, unknown> | null | undefined;
        options?: Record<string, string> | undefined;
    }[] | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    shipping_profile_id?: string | null | undefined;
    description?: string | null | undefined;
    title?: string | undefined;
    status?: ProductStatus | undefined;
    handle?: string | null | undefined;
    is_giftcard?: string | boolean | undefined;
    external_id?: string | null | undefined;
    collection_id?: string | null | undefined;
    type_id?: string | null | undefined;
    thumbnail?: string | null | undefined;
    origin_country?: string | null | undefined;
    hs_code?: string | null | undefined;
    mid_code?: string | null | undefined;
    material?: string | null | undefined;
    weight?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    subtitle?: string | null | undefined;
    discountable?: string | boolean | undefined;
    categories?: {
        id: string;
    }[] | undefined;
    tags?: {
        id: string;
    }[] | undefined;
    images?: {
        url: string;
    }[] | undefined;
    sales_channels?: {
        id: string;
    }[] | undefined;
}>;
export declare const AdminCreateVariantInventoryItem: z.ZodObject<{
    required_quantity: z.ZodNumber;
    inventory_item_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    inventory_item_id: string;
    required_quantity: number;
}, {
    inventory_item_id: string;
    required_quantity: number;
}>;
export type AdminCreateVariantInventoryItemType = z.infer<typeof AdminCreateVariantInventoryItem>;
export declare const AdminUpdateVariantInventoryItem: z.ZodObject<{
    required_quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    required_quantity: number;
}, {
    required_quantity: number;
}>;
export type AdminUpdateVariantInventoryItemType = z.infer<typeof AdminUpdateVariantInventoryItem>;
export declare const AdminBatchCreateVariantInventoryItem: z.ZodObject<{
    required_quantity: z.ZodNumber;
    inventory_item_id: z.ZodString;
    variant_id: z.ZodString;
}, "strict", z.ZodTypeAny, {
    variant_id: string;
    inventory_item_id: string;
    required_quantity: number;
}, {
    variant_id: string;
    inventory_item_id: string;
    required_quantity: number;
}>;
export type AdminBatchCreateVariantInventoryItemType = z.infer<typeof AdminBatchCreateVariantInventoryItem>;
export declare const AdminBatchUpdateVariantInventoryItem: z.ZodObject<{
    required_quantity: z.ZodNumber;
    inventory_item_id: z.ZodString;
    variant_id: z.ZodString;
}, "strict", z.ZodTypeAny, {
    variant_id: string;
    inventory_item_id: string;
    required_quantity: number;
}, {
    variant_id: string;
    inventory_item_id: string;
    required_quantity: number;
}>;
export type AdminBatchUpdateVariantInventoryItemType = z.infer<typeof AdminBatchUpdateVariantInventoryItem>;
export declare const AdminBatchDeleteVariantInventoryItem: z.ZodObject<{
    inventory_item_id: z.ZodString;
    variant_id: z.ZodString;
}, "strict", z.ZodTypeAny, {
    variant_id: string;
    inventory_item_id: string;
}, {
    variant_id: string;
    inventory_item_id: string;
}>;
export type AdminBatchDeleteVariantInventoryItemType = z.infer<typeof AdminBatchDeleteVariantInventoryItem>;
export type AdminBatchVariantInventoryItemsType = BatchMethodRequest<AdminBatchCreateVariantInventoryItemType, AdminBatchUpdateVariantInventoryItemType, AdminBatchDeleteVariantInventoryItemType>;
//# sourceMappingURL=validators.d.ts.map