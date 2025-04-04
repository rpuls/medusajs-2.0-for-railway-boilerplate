import { z, ZodEffects, ZodNullable, ZodObject, ZodOptional } from "zod";
/**
 * Wraps the original schema to a function to accept and merge
 * additional_data schema
 */
export declare const WithAdditionalData: <T extends ZodObject<any, any>>(originalSchema: T, modifyCallback?: (schema: T) => ZodObject<any, any> | ZodEffects<any, any>) => (additionalDataValidator?: ZodOptional<ZodNullable<ZodObject<any, any>>>) => z.ZodObject<any, any, z.ZodTypeAny, {
    [x: string]: any;
}, {
    [x: string]: any;
}> | z.ZodEffects<any, any, any>;
export declare const createBatchBody: (createValidator: z.ZodType, updateValidator: z.ZodType, deleteValidator?: z.ZodType) => z.ZodObject<{
    create: z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>;
    update: z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>;
    delete: z.ZodOptional<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>;
}, "strip", z.ZodTypeAny, {
    create?: any[] | undefined;
    update?: any[] | undefined;
    delete?: any[] | undefined;
}, {
    create?: any[] | undefined;
    update?: any[] | undefined;
    delete?: any[] | undefined;
}>;
export declare const createLinkBody: () => z.ZodObject<{
    add: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    remove: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    add?: string[] | undefined;
    remove?: string[] | undefined;
}, {
    add?: string[] | undefined;
    remove?: string[] | undefined;
}>;
export declare const createSelectParams: () => z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fields?: string | undefined;
}, {
    fields?: string | undefined;
}>;
export declare const createFindParams: ({ offset, limit, order, }?: {
    offset?: number;
    limit?: number;
    order?: string;
}) => z.ZodObject<{
    fields: z.ZodOptional<z.ZodString>;
    offset: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodNumber>>, number, unknown>;
    limit: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodNumber>>, number, unknown>;
    order: z.ZodOptional<z.ZodString> | z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    offset: number;
    limit: number;
    fields?: string | undefined;
    order?: string | undefined;
}, {
    fields?: string | undefined;
    offset?: unknown;
    limit?: unknown;
    order?: string | undefined;
}>;
export declare const createOperatorMap: (type?: z.ZodType, valueParser?: (val: any) => any) => z.ZodUnion<[any, z.ZodObject<{
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
}>]>;
//# sourceMappingURL=validators.d.ts.map