import { z } from "zod";
export type AdminGetInventoryItemParamsType = z.infer<typeof AdminGetInventoryItemParams>;
export declare const AdminGetInventoryItemParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminGetInventoryItemsParamsFields: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    sku: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    origin_country: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    mid_code: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    hs_code: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    material: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    requires_shipping: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodUnion<[z.ZodBoolean, z.ZodString]>, string | boolean, string | boolean>, boolean, string | boolean>>;
    weight: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
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
    length: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
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
    height: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
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
    width: z.ZodOptional<z.ZodUnion<[any, z.ZodObject<{
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
    location_levels: z.ZodOptional<z.ZodObject<{
        location_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    }, "strip", z.ZodTypeAny, {
        location_id?: string | string[] | undefined;
    }, {
        location_id?: string | string[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    q?: string | undefined;
    id?: string | string[] | undefined;
    sku?: string | string[] | undefined;
    origin_country?: string | string[] | undefined;
    mid_code?: string | string[] | undefined;
    hs_code?: string | string[] | undefined;
    material?: string | string[] | undefined;
    requires_shipping?: boolean | undefined;
    weight?: any;
    length?: any;
    height?: any;
    width?: any;
    location_levels?: {
        location_id?: string | string[] | undefined;
    } | undefined;
}, {
    q?: string | undefined;
    id?: string | string[] | undefined;
    sku?: string | string[] | undefined;
    origin_country?: string | string[] | undefined;
    mid_code?: string | string[] | undefined;
    hs_code?: string | string[] | undefined;
    material?: string | string[] | undefined;
    requires_shipping?: string | boolean | undefined;
    weight?: any;
    length?: any;
    height?: any;
    width?: any;
    location_levels?: {
        location_id?: string | string[] | undefined;
    } | undefined;
}>;
export type AdminGetInventoryItemsParamsType = z.infer<typeof AdminGetInventoryItemsParams>;
export declare const AdminGetInventoryItemsParams: z.ZodObject<{
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
}, "strict", z.ZodTypeAny, {
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
export type AdminGetInventoryLocationLevelParamsType = z.infer<typeof AdminGetInventoryLocationLevelParams>;
export declare const AdminGetInventoryLocationLevelParams: z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const AdminGetInventoryLocationLevelsParamsFields: z.ZodObject<{
    location_id: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
}, "strip", z.ZodTypeAny, {
    location_id?: string | string[] | undefined;
}, {
    location_id?: string | string[] | undefined;
}>;
export type AdminGetInventoryLocationLevelsParamsType = z.infer<typeof AdminGetInventoryLocationLevelsParams>;
export declare const AdminGetInventoryLocationLevelsParams: z.ZodObject<{
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
export type AdminCreateInventoryLocationLevelType = z.infer<typeof AdminCreateInventoryLocationLevel>;
export declare const AdminCreateInventoryLocationLevel: z.ZodObject<{
    location_id: z.ZodString;
    stocked_quantity: z.ZodOptional<z.ZodNumber>;
    incoming_quantity: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    location_id: string;
    stocked_quantity?: number | undefined;
    incoming_quantity?: number | undefined;
}, {
    location_id: string;
    stocked_quantity?: number | undefined;
    incoming_quantity?: number | undefined;
}>;
export type AdminUpdateInventoryLocationLevelBatchType = z.infer<typeof AdminUpdateInventoryLocationLevelBatch>;
export declare const AdminUpdateInventoryLocationLevelBatch: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    location_id: z.ZodString;
    stocked_quantity: z.ZodOptional<z.ZodNumber>;
    incoming_quantity: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    location_id: string;
    id?: string | undefined;
    stocked_quantity?: number | undefined;
    incoming_quantity?: number | undefined;
}, {
    location_id: string;
    id?: string | undefined;
    stocked_quantity?: number | undefined;
    incoming_quantity?: number | undefined;
}>;
export type AdminBatchInventoryItemLocationsLevelType = z.infer<typeof AdminBatchInventoryItemLocationsLevel>;
export declare const AdminBatchInventoryItemLocationsLevel: z.ZodObject<{
    create: z.ZodOptional<z.ZodArray<z.ZodObject<{
        location_id: z.ZodString;
        stocked_quantity: z.ZodOptional<z.ZodNumber>;
        incoming_quantity: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        location_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }, {
        location_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }>, "many">>;
    update: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        location_id: z.ZodString;
        stocked_quantity: z.ZodOptional<z.ZodNumber>;
        incoming_quantity: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        location_id: string;
        id?: string | undefined;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }, {
        location_id: string;
        id?: string | undefined;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }>, "many">>;
    delete: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    force: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    create?: {
        location_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }[] | undefined;
    update?: {
        location_id: string;
        id?: string | undefined;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }[] | undefined;
    delete?: string[] | undefined;
    force?: boolean | undefined;
}, {
    create?: {
        location_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }[] | undefined;
    update?: {
        location_id: string;
        id?: string | undefined;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }[] | undefined;
    delete?: string[] | undefined;
    force?: boolean | undefined;
}>;
export type AdminUpdateInventoryLocationLevelType = z.infer<typeof AdminUpdateInventoryLocationLevel>;
export declare const AdminUpdateInventoryLocationLevel: z.ZodObject<{
    stocked_quantity: z.ZodOptional<z.ZodNumber>;
    incoming_quantity: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    stocked_quantity?: number | undefined;
    incoming_quantity?: number | undefined;
}, {
    stocked_quantity?: number | undefined;
    incoming_quantity?: number | undefined;
}>;
export type AdminCreateInventoryItemType = z.infer<typeof AdminCreateInventoryItem>;
export declare const AdminCreateInventoryItem: z.ZodObject<{
    sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    requires_shipping: z.ZodOptional<z.ZodBoolean>;
    thumbnail: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    location_levels: z.ZodOptional<z.ZodArray<z.ZodObject<{
        location_id: z.ZodString;
        stocked_quantity: z.ZodOptional<z.ZodNumber>;
        incoming_quantity: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        location_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }, {
        location_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    sku?: string | null | undefined;
    hs_code?: string | null | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    origin_country?: string | null | undefined;
    mid_code?: string | null | undefined;
    material?: string | null | undefined;
    title?: string | null | undefined;
    description?: string | null | undefined;
    requires_shipping?: boolean | undefined;
    thumbnail?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    location_levels?: {
        location_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }[] | undefined;
}, {
    sku?: string | null | undefined;
    hs_code?: string | null | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    origin_country?: string | null | undefined;
    mid_code?: string | null | undefined;
    material?: string | null | undefined;
    title?: string | null | undefined;
    description?: string | null | undefined;
    requires_shipping?: boolean | undefined;
    thumbnail?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
    location_levels?: {
        location_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }[] | undefined;
}>;
export type AdminUpdateInventoryItemType = z.infer<typeof AdminUpdateInventoryItem>;
export declare const AdminUpdateInventoryItem: z.ZodObject<{
    sku: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    hs_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    weight: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    length: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    height: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    width: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    origin_country: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mid_code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    material: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    requires_shipping: z.ZodOptional<z.ZodBoolean>;
    thumbnail: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strict", z.ZodTypeAny, {
    sku?: string | null | undefined;
    hs_code?: string | null | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    origin_country?: string | null | undefined;
    mid_code?: string | null | undefined;
    material?: string | null | undefined;
    title?: string | null | undefined;
    description?: string | null | undefined;
    requires_shipping?: boolean | undefined;
    thumbnail?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}, {
    sku?: string | null | undefined;
    hs_code?: string | null | undefined;
    weight?: number | null | undefined;
    length?: number | null | undefined;
    height?: number | null | undefined;
    width?: number | null | undefined;
    origin_country?: string | null | undefined;
    mid_code?: string | null | undefined;
    material?: string | null | undefined;
    title?: string | null | undefined;
    description?: string | null | undefined;
    requires_shipping?: boolean | undefined;
    thumbnail?: string | null | undefined;
    metadata?: Record<string, unknown> | null | undefined;
}>;
export declare const AdminBatchInventoryItemLevels: z.ZodObject<{
    create: z.ZodOptional<z.ZodArray<z.ZodObject<{
        inventory_item_id: z.ZodString;
        location_id: z.ZodString;
        stocked_quantity: z.ZodOptional<z.ZodNumber>;
        incoming_quantity: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        location_id: string;
        inventory_item_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }, {
        location_id: string;
        inventory_item_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }>, "many">>;
    update: z.ZodOptional<z.ZodArray<z.ZodObject<{
        inventory_item_id: z.ZodString;
        location_id: z.ZodString;
        stocked_quantity: z.ZodOptional<z.ZodNumber>;
        incoming_quantity: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        location_id: string;
        inventory_item_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }, {
        location_id: string;
        inventory_item_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }>, "many">>;
    delete: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    force: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    create?: {
        location_id: string;
        inventory_item_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }[] | undefined;
    update?: {
        location_id: string;
        inventory_item_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }[] | undefined;
    delete?: string[] | undefined;
    force?: boolean | undefined;
}, {
    create?: {
        location_id: string;
        inventory_item_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }[] | undefined;
    update?: {
        location_id: string;
        inventory_item_id: string;
        stocked_quantity?: number | undefined;
        incoming_quantity?: number | undefined;
    }[] | undefined;
    delete?: string[] | undefined;
    force?: boolean | undefined;
}>;
export type AdminBatchInventoryItemLevelsType = z.infer<typeof AdminBatchInventoryItemLevels>;
//# sourceMappingURL=validators.d.ts.map